import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Initialize the session from Supabase
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.next(session?.user ?? null);
    });

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
}