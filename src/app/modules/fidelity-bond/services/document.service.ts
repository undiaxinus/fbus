import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Observable, from, map, catchError, throwError } from 'rxjs';

export interface FbusDocument {
  id: string;
  bond_id: string;
  document_type: 'profile' | 'designation' | 'risk';
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

@Injectable()
export class DocumentService {
  private readonly BUCKET_NAME = 'fbus';
  private readonly TABLE_NAME = 'fbus_documents';
  private readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor(private supabase: SupabaseService) {}

  /**
   * Upload a document and create a record in the documents table
   */
  async uploadDocument(
    file: File,
    bondId: string,
    documentType: 'profile' | 'designation' | 'risk'
  ): Promise<FbusDocument> {
    try {
      // Validate inputs
      if (!file) throw new Error('File is required');
      if (!bondId) throw new Error('Bond ID is required');
      if (!this.UUID_REGEX.test(bondId)) throw new Error('Invalid bond ID format');
      if (!documentType) throw new Error('Document type is required');

      // Generate unique filename with timestamp to avoid collisions
      const timestamp = new Date().getTime();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${documentType}_${bondId}_${timestamp}_${safeFileName}`;

      // Upload file to storage
      const { data: storageData, error: storageError } = await this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .upload(`documents/${uniqueFilename}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(`documents/${uniqueFilename}`);

      // Create new document record
      const { data: document, error: dbError } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .insert({
          bond_id: bondId,
          document_type: documentType,
          file_name: uniqueFilename,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!document) throw new Error('Failed to create document record');

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a specific bond
   */
  getDocuments(bondId: string): Observable<FbusDocument[]> {
    if (!this.UUID_REGEX.test(bondId)) {
      return throwError(() => new Error('Invalid bond ID format'));
    }

    return from(
      this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('*')
        .eq('bond_id', bondId)
        .is('deleted_at', null)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),
      catchError(error => {
        console.error('Error fetching documents:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific document by type for a bond
   */
  getDocumentByType(bondId: string, documentType: 'profile' | 'designation' | 'risk'): Observable<FbusDocument | null> {
    if (!this.UUID_REGEX.test(bondId)) {
      return throwError(() => new Error('Invalid bond ID format'));
    }

    return from(
      this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('*')
        .eq('bond_id', bondId)
        .eq('document_type', documentType)
        .is('deleted_at', null)
        .maybeSingle()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error fetching document:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a document (soft delete)
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      if (!this.UUID_REGEX.test(documentId)) {
        throw new Error('Invalid document ID format');
      }

      // Get document details first
      const { data: document, error: fetchError } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('file_name')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      if (!document) throw new Error('Document not found');

      // Delete from storage
      const { error: storageError } = await this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .remove([`documents/${document.file_name}`]);

      if (storageError) {
        console.warn('Error removing file from storage:', storageError);
        // Continue with soft delete even if storage delete fails
      }

      // Update the document record without modifying deleted_at
      const { error: dbError } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Replace an existing document with a new one
   */
  async replaceDocument(
    documentId: string,
    file: File,
    bondId: string,
    documentType: 'profile' | 'designation' | 'risk'
  ): Promise<FbusDocument> {
    try {
      // Validate inputs
      if (!this.UUID_REGEX.test(documentId)) throw new Error('Invalid document ID format');
      if (!this.UUID_REGEX.test(bondId)) throw new Error('Invalid bond ID format');
      if (!file) throw new Error('File is required');
      if (!documentType) throw new Error('Document type is required');

      // Soft delete the old document
      await this.deleteDocument(documentId);
      
      // Upload the new document
      return await this.uploadDocument(file, bondId, documentType);
    } catch (error) {
      console.error('Error replacing document:', error);
      throw error;
    }
  }

  /**
   * Get all documents of a specific type for a bond, sorted by update date
   */
  getDocumentsByType(bondId: string, documentType: 'profile' | 'designation' | 'risk'): Observable<FbusDocument[]> {
    if (!this.UUID_REGEX.test(bondId)) {
      return throwError(() => new Error('Invalid bond ID format'));
    }

    return from(
      this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('*')
        .eq('bond_id', bondId)
        .eq('document_type', documentType)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),
      catchError(error => {
        console.error('Error fetching documents:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the latest document of a specific type
   */
  getLatestDocument(bondId: string, documentType: 'profile' | 'designation' | 'risk'): Observable<FbusDocument | null> {
    return this.getDocumentsByType(bondId, documentType).pipe(
      map(documents => documents.length > 0 ? documents[0] : null)
    );
  }
} 