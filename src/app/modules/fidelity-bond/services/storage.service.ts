import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly BUCKET_NAME = 'fbus';
  private readonly FOLDERS = {
    PROFILES: 'profiles',
    DESIGNATIONS: 'designations',
    RISKS: 'risks'
  };

  constructor(private supabase: SupabaseService) {
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: existingBucket, error: bucketError } = await this.supabase.getClient()
        .storage
        .getBucket(this.BUCKET_NAME);

      if (bucketError) {
        // If bucket doesn't exist, create it
        const { data, error: createError } = await this.supabase.getClient()
          .storage
          .createBucket(this.BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/*']
          });

        if (createError) {
          throw createError;
        }

        // Create the necessary folders
        await Promise.all([
          this.createFolder(this.FOLDERS.PROFILES),
          this.createFolder(this.FOLDERS.DESIGNATIONS),
          this.createFolder(this.FOLDERS.RISKS)
        ]);

        console.log(`Created bucket: ${this.BUCKET_NAME}`);
      }

    } catch (error) {
      console.error('Error initializing storage bucket:', error);
      throw error;
    }
  }

  private async createFolder(folderName: string) {
    try {
      // Create an empty file to represent the folder
      const { error } = await this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .upload(`${folderName}/.keep`, new Blob(['']));

      if (error) {
        console.error(`Error creating folder ${folderName}:`, error);
      }
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error);
    }
  }

  async uploadFile(file: File, folder: string): Promise<string> {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${folder}/${timestamp}_${randomString}_${safeFileName}`;

      // Upload the file with anon key
      const { data, error: uploadError } = await this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: publicUrl } = this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Extract just the file path from the full URL if it's a URL
      const path = filePath.includes('storage/v1/object/public/')
        ? filePath.split('storage/v1/object/public/')[1].split('?')[0]
        : filePath;

      const { error } = await this.supabase.getClient()
        .storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Helper methods to make code more readable
  uploadProfileImage(file: File): Promise<string> {
    return this.uploadFile(file, this.FOLDERS.PROFILES);
  }

  uploadDesignationImage(file: File): Promise<string> {
    return this.uploadFile(file, this.FOLDERS.DESIGNATIONS);
  }

  uploadRiskImage(file: File): Promise<string> {
    return this.uploadFile(file, this.FOLDERS.RISKS);
  }
} 