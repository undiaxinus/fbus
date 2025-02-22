import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  user_metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private supabase: SupabaseClient;

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    const currentUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(currentUser ? JSON.parse(currentUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        this.logout();
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(user: User) {
    try {
      // Sign in with Supabase using dummy credentials for now
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: user.username,
        password: 'dummy-password' // This should be replaced with actual authentication
      });

      if (error) throw error;

      // Update user metadata
      await this.supabase.auth.updateUser({
        data: {
          role: user.role,
          name: user.name
        }
      });

      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  async refreshSession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      
      if (!session) {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await this.supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        if (!refreshedSession) {
          this.logout();
          throw new Error('No valid session');
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      this.logout();
      throw error;
    }
  }
} 