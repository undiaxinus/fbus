import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BondLookupRequest {
  contact_no: string;
  first_name: string;
  last_name: string;
}

export interface BondDetails {
  id: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  designation: string;
  days_remaining: number;
  units: string;
  profile: string;
}

@Injectable({
  providedIn: 'root'
})
export class BondService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  lookupBond(request: BondLookupRequest): Observable<BondDetails | null> {
    return from(
      this.supabase
        .from('fbus_list')
        .select('*')
        .eq('contact_no', request.contact_no)
        .eq('first_name', request.first_name)
        .eq('last_name', request.last_name)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as BondDetails;
      })
    );
  }

  async generatePDF(bondDetails: BondDetails): Promise<Blob> {
    // Implement PDF generation logic here
    // You might want to use a library like pdfmake or jspdf
    throw new Error('PDF generation not implemented yet');
  }
}
