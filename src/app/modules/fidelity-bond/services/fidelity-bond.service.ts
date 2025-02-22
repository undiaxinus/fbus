import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { FidelityBond } from '../models/fidelity-bond.model';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, retry, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FidelityBondService {
  private readonly TABLE_NAME = 'fbus_fidelity_bonds';
  private readonly MAX_RETRIES = 3;

  constructor(private supabase: SupabaseService) {}

  private async getCurrentUser() {
    const isAuthenticated = await this.supabase.isAuthenticated();
    console.log('Is authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      throw new Error('No authenticated user found');
    }
    const user = this.supabase.currentUser;
    console.log('Current user:', user);
    return user;
  }

  getBonds(): Observable<FidelityBond[]> {
    console.log('Fetching bonds from table:', this.TABLE_NAME);
    return from(
      this.supabase.client
        .from(this.TABLE_NAME)
        .select(`
          *,
          created_by (
            id,
            name
          ),
          updated_by (
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    ).pipe(
      tap(response => {
        console.log('Raw Supabase response:', response);
        if (response.error) {
          console.error('Supabase query error:', response.error);
          console.error('Error details:', {
            code: response.error.code,
            message: response.error.message,
            details: response.error.details,
            hint: response.error.hint
          });
        } else {
          console.log('Fetched bonds count:', response.data?.length || 0);
          console.log('Fetched bonds:', response.data);
        }
      }),
      map(({ data, error }) => {
        if (error) {
          console.error('Error in getBonds:', error);
          throw error;
        }
        if (!data) {
          console.log('No data returned from Supabase');
          return [];
        }
        return data.map(bond => ({
          ...bond,
          effectivity_date: bond.effectivity_date ? new Date(bond.effectivity_date) : null,
          date_of_cancellation: bond.date_of_cancellation ? new Date(bond.date_of_cancellation) : null,
          created_at: bond.created_at ? new Date(bond.created_at) : null,
          updated_at: bond.updated_at ? new Date(bond.updated_at) : null,
          deleted_at: bond.deleted_at ? new Date(bond.deleted_at) : null,
          created_by: bond.created_by?.id || null,
          updated_by: bond.updated_by?.id || null,
          created_by_name: bond.created_by?.name || null,
          updated_by_name: bond.updated_by?.name || null
        })) as FidelityBond[];
      }),
      catchError(error => {
        console.error('Error fetching bonds:', error);
        if (error.code === 'PGRST301') {
          console.error('Foreign key violation. Please check user references.');
        }
        return throwError(() => error);
      })
    );
  }

  createBond(bond: Omit<FidelityBond, 'id' | 'created_at' | 'updated_at'>): Observable<FidelityBond> {
    return from(this.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const bondWithUser = {
          ...bond,
          created_by: user.id,
          updated_by: user.id,
          effectivity_date: bond.effectivity_date ? new Date(bond.effectivity_date).toISOString() : null,
          date_of_cancellation: bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toISOString() : null,
          mca: typeof bond.mca === 'string' ? parseFloat(bond.mca) : bond.mca,
          amount_of_bond: typeof bond.amount_of_bond === 'string' ? parseFloat(bond.amount_of_bond) : bond.amount_of_bond,
          bond_premium: typeof bond.bond_premium === 'string' ? parseFloat(bond.bond_premium) : bond.bond_premium
        };

        console.log('Attempting to insert bond with data:', bondWithUser);

        return from(
          this.supabase.client
            .from(this.TABLE_NAME)
            .insert(bondWithUser)
            .select(`
              *,
              created_by (
                id,
                name
              ),
              updated_by (
                id,
                name
              )
            `)
            .single()
        ).pipe(
          retry(this.MAX_RETRIES),
          tap(response => {
            if (response.error) {
              console.error('Supabase insert error:', response.error);
              console.error('Error details:', {
                code: response.error.code,
                message: response.error.message,
                details: response.error.details,
                hint: response.error.hint
              });
            } else {
              console.log('Bond inserted successfully:', response.data);
            }
          })
        );
      }),
      map(({ data, error }) => {
        if (error) {
          console.error('Error details:', error);
          throw error;
        }
        return {
          ...data,
          effectivity_date: data.effectivity_date ? new Date(data.effectivity_date) : null,
          date_of_cancellation: data.date_of_cancellation ? new Date(data.date_of_cancellation) : null,
          created_at: data.created_at ? new Date(data.created_at) : null,
          updated_at: data.updated_at ? new Date(data.updated_at) : null,
          created_by: data.created_by?.id || null,
          updated_by: data.updated_by?.id || null,
          created_by_name: data.created_by?.name || null,
          updated_by_name: data.updated_by?.name || null
        } as FidelityBond;
      }),
      catchError(error => {
        console.error('Error in createBond:', error);
        if (error.code === 'PGRST301') {
          return throwError(() => new Error('Unable to create bond. Please check if all required fields are provided.'));
        }
        return throwError(() => error);
      })
    );
  }

  updateBond(id: string, bond: Partial<FidelityBond>): Observable<FidelityBond> {
    return from(this.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        const bondWithUser = {
          ...bond,
          updated_by: user.id,
          effectivity_date: bond.effectivity_date ? new Date(bond.effectivity_date).toISOString() : undefined,
          date_of_cancellation: bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toISOString() : undefined,
          mca: typeof bond.mca === 'string' ? parseFloat(bond.mca) : bond.mca,
          amount_of_bond: typeof bond.amount_of_bond === 'string' ? parseFloat(bond.amount_of_bond) : bond.amount_of_bond,
          bond_premium: typeof bond.bond_premium === 'string' ? parseFloat(bond.bond_premium) : bond.bond_premium
        };

        return from(
          this.supabase.client
            .from(this.TABLE_NAME)
            .update(bondWithUser)
            .eq('id', id)
            .select(`
              *,
              created_by (
                id,
                name
              ),
              updated_by (
                id,
                name
              )
            `)
            .single()
        ).pipe(retry(this.MAX_RETRIES));
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return {
          ...data,
          effectivity_date: data.effectivity_date ? new Date(data.effectivity_date) : null,
          date_of_cancellation: data.date_of_cancellation ? new Date(data.date_of_cancellation) : null,
          created_at: data.created_at ? new Date(data.created_at) : null,
          updated_at: data.updated_at ? new Date(data.updated_at) : null,
          created_by: data.created_by?.id || null,
          updated_by: data.updated_by?.id || null,
          created_by_name: data.created_by?.name || null,
          updated_by_name: data.updated_by?.name || null
        } as FidelityBond;
      }),
      catchError(error => {
        console.error('Error updating bond:', error);
        return throwError(() => error);
      })
    );
  }

  deleteBond(id: string): Observable<void> {
    return from(this.getCurrentUser()).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }

        return from(
          this.supabase.client
            .from(this.TABLE_NAME)
            .update({ 
              deleted_at: new Date().toISOString(),
              updated_by: user.id
            })
            .eq('id', id)
        ).pipe(retry(this.MAX_RETRIES));
      }),
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError(error => {
        console.error('Error deleting bond:', error);
        return throwError(() => error);
      })
    );
  }
} 