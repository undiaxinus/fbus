import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  async login(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch additional user data from your users table
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('role, name')
          .eq('email', email)
          .single();

        if (userError) throw userError;

        // Update user's role in Supabase auth metadata
        await this.supabase.auth.updateUser({
          data: { role: userData.role }
        });

        const user: User = {
          id: data.user.id,
          username: email,
          role: userData.role,
          name: userData.name
        };

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
        return { user, error: null };
      }

      return { user: null, error: 'No user data found' };
    } catch (error) {
      return { user: null, error };
    }
  }

  async register(email: string, password: string, role: string = 'fbus_user'): Promise<{ user: User | null; error: any }> {
    try {
      // Register the user with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create a record in the users table with the specified role
        const { error: userError } = await this.supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              role: role,
              name: email.split('@')[0] // Default name from email
            }
          ]);

        if (userError) throw userError;

        return {
          user: {
            id: data.user.id,
            username: email,
            role: role,
            name: email.split('@')[0]
          },
          error: null
        };
      }

      return { user: null, error: new Error('Registration failed') };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error };
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return this.supabase.auth.signOut();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}