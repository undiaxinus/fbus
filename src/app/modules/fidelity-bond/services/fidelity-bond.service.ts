import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, from } from 'rxjs';
import { FidelityBond, FidelityBondCreate } from '../models/fidelity-bond.interface';
import { environment } from '@env/environment';
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { AuthService } from '../../../core/services/auth.service';

// Extended User interface to include required properties
interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  user_metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class FidelityBondService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(async (user) => {
      if (user) {
        try {
          // Update the user's metadata and role in Supabase
          await this.supabase.auth.updateUser({
            data: {
              role: user.role,
              name: user.name
            }
          });
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      }
    });
  }

  private async ensureAuthRole(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        // If no session, try to refresh it
        const { data: { session: refreshedSession }, error: refreshError } = 
          await this.supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
        if (!refreshedSession) throw new Error('No valid session');
      }

      // Ensure the role is set in the user's metadata
      await this.supabase.auth.updateUser({
        data: {
          role: currentUser.role,
          name: currentUser.name
        }
      });

    } catch (error) {
      console.error('Error ensuring auth role:', error);
      throw new Error('Authentication failed');
    }
  }

  getBonds(): Observable<FidelityBond[]> {
    return from(
      this.ensureAuthRole().then(() =>
        this.supabase
          .from('fbus_fidelity_bonds')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
      ).then(({ data, error }) => {
        if (error) throw error;
        return data as FidelityBond[];
      })
    );
  }

  getBond(id: string): Observable<FidelityBond> {
    return from(
      this.ensureAuthRole().then(() =>
        this.supabase
          .from('fbus_fidelity_bonds')
          .select('*')
          .eq('id', id)
          .single()
      ).then(({ data, error }) => {
        if (error) throw error;
        return data as FidelityBond;
      })
    );
  }

  createBond(bond: FidelityBondCreate): Observable<FidelityBond> {
    return from(
      this.ensureAuthRole().then(async () => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const bondData = {
          ...bond,
          created_by: currentUser.id,
          updated_by: currentUser.id
        };

        const { data, error } = await this.supabase
          .from('fbus_fidelity_bonds')
          .insert([bondData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }

        return data as FidelityBond;
      })
    );
  }

  updateBond(id: string, bond: Partial<FidelityBond>): Observable<FidelityBond> {
    return from(
      this.ensureAuthRole().then(async () => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const updateData = {
          ...bond,
          updated_by: currentUser.id
        };

        const { data, error } = await this.supabase
          .from('fbus_fidelity_bonds')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as FidelityBond;
      })
    );
  }

  deleteBond(id: string): Observable<void> {
    return from(
      this.ensureAuthRole().then(async () => {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        const { error } = await this.supabase
          .from('fbus_fidelity_bonds')
          .update({
            deleted_at: new Date().toISOString(),
            updated_by: currentUser.id
          })
          .eq('id', id);

        if (error) throw error;
      })
    );
  }
} 