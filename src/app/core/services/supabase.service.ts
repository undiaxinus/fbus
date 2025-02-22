import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private initialized = false;

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    if (this.initialized) return;

    try {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            storageKey: 'fbus_auth',
            storage: localStorage,
            detectSessionInUrl: true,
            flowType: 'implicit'
          }
        }
      );

      // Load initial session
      const { data: { session } } = await this.supabase.auth.getSession();
      this.userSubject.next(session?.user || null);

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user);
        this.userSubject.next(session?.user || null);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }

  get client() {
    if (!this.initialized) {
      this.initializeSupabase();
    }
    return this.supabase;
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      const hasUser = !!session?.user;
      console.log('Authentication check:', hasUser ? 'Authenticated' : 'Not authenticated');
      return hasUser;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      this.userSubject.next(data.user);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      this.userSubject.next(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
} 