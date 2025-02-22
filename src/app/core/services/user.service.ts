import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  name: string;
  system_role: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private supabase: SupabaseService) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const { data, error }: SupabaseResponse<User> = await this.supabase.getClient()
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, data.password);
      return isValidPassword ? data : null;

    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  getUsers(): Observable<User[]> {
    return from(
      this.supabase.getClient()
        .from('users')
        .select('*')
        .then(({ data, error }: SupabaseResponse<User[]>) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  async createUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      // Hash password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const { data, error }: SupabaseResponse<User> = await this.supabase.getClient()
        .from('users')
        .insert([{
          username: user.username,
          password: hashedPassword, // Store hashed password
          name: user.name,
          role: user.role,
          system_role: user.system_role
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      // If password is being updated, hash it
      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      const { data, error }: SupabaseResponse<User> = await this.supabase.getClient()
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.getClient()
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
} 