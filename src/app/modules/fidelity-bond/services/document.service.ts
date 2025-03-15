import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Observable, from, map, catchError, throwError, retry, delay } from 'rxjs';

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
  private readonly FOLDERS = {
    profile: 'profiles',
    designation: 'designations',
    risk: 'risks'
  };
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  constructor(private supabase: SupabaseService) {}

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Check authentication before each attempt
        const session = await this.supabase.getClient().auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }
        return await operation();
      } catch (error: any) {
        lastError = error;
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
          continue;
        }
      }
    }
    throw lastError;
  }

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

      return await this.retryOperation(async () => {
        // Get the correct folder for this document type
        const folder = this.FOLDERS[documentType];
        if (!folder) throw new Error('Invalid document type');

        // Generate unique filename with timestamp to avoid collisions
        const timestamp = new Date().getTime();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${documentType}_${bondId}_${timestamp}_${safeFileName}`;

        // Upload file to storage in the correct folder
        const { data: storageData, error: storageError } = await this.supabase.getClient()
          .storage
          .from(this.BUCKET_NAME)
          .upload(`${folder}/${uniqueFilename}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (storageError) {
          console.error('Storage error:', storageError);
          throw new Error(`Failed to upload file: ${storageError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase.getClient()
          .storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${folder}/${uniqueFilename}`);

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

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error(`Failed to create document record: ${dbError.message}`);
        }
        if (!document) throw new Error('Failed to create document record');

        return document;
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Get all documents for a specific bond
   */
  getDocuments(bondId: string): Observable<FbusDocument[]> {
    if (!this.UUID_REGEX.test(bondId)) {
      return throwError(() => new Error('Invalid bond ID format'));
    }

    return from(this.retryOperation(async () => {
      const { data, error } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('*')
        .eq('bond_id', bondId)
        .is('deleted_at', null);

      if (error) throw error;
      return data || [];
    })).pipe(
      retry({ count: this.MAX_RETRIES, delay: this.RETRY_DELAY }),
      catchError(error => {
        console.error('Error fetching documents:', error);
        return throwError(() => new Error(`Failed to fetch documents: ${error.message}`));
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

    return from(this.retryOperation(async () => {
      const { data, error } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('*')
        .eq('bond_id', bondId)
        .eq('document_type', documentType)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    })).pipe(
      retry({ count: this.MAX_RETRIES, delay: this.RETRY_DELAY }),
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

      await this.retryOperation(async () => {
        // Get document details first
        const { data: documents, error: fetchError } = await this.supabase.getClient()
          .from(this.TABLE_NAME)
          .select('file_name, document_type')
          .eq('id', documentId);

        if (fetchError) throw fetchError;
        if (!documents || documents.length === 0) {
          console.warn('No documents found for deletion');
          return;
        }

        // Process each document found
        for (const document of documents) {
          try {
            // Get the correct folder for this document type
            const documentType = document.document_type as keyof typeof this.FOLDERS;
            const folder = this.FOLDERS[documentType];
            if (!folder) {
              console.warn(`Invalid document type for document: ${documentId}`);
              continue;
            }

            // Delete from storage
            const { error: storageError } = await this.supabase.getClient()
              .storage
              .from(this.BUCKET_NAME)
              .remove([`${folder}/${document.file_name}`]);

            if (storageError) {
              console.warn('Error removing file from storage:', storageError);
              // Continue with database delete even if storage delete fails
            }
          } catch (error) {
            console.warn(`Error processing document ${documentId}:`, error);
            // Continue with other documents
          }
        }

        // Delete the document record from the database
        const { error: dbError } = await this.supabase.getClient()
          .from(this.TABLE_NAME)
          .delete()
          .eq('id', documentId);

        if (dbError) throw dbError;
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Delete all documents for a specific bond and type
   */
  async deleteAllDocuments(bondId: string, documentType: 'profile' | 'designation' | 'risk'): Promise<void> {
    try {
      if (!this.UUID_REGEX.test(bondId)) {
        throw new Error('Invalid bond ID format');
      }

      // Get all documents of this type for the bond
      const { data: documents, error: fetchError } = await this.supabase.getClient()
        .from(this.TABLE_NAME)
        .select('id, file_name, document_type')
        .eq('bond_id', bondId)
        .eq('document_type', documentType)
        .is('deleted_at', null);

      if (fetchError) throw fetchError;
      if (!documents || documents.length === 0) return;

      // Delete each document
      for (const doc of documents) {
        await this.deleteDocument(doc.id);
      }
    } catch (error) {
      console.error('Error deleting all documents:', error);
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