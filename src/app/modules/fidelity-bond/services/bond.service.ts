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
  rank: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  designation: string;
  despic: string;
  unit_office: string;
  mca: string;
  amount_of_bond: string;
  bond_premium: string;
  risk_no: string;
  riskpic: string;
  effective_date: string;
  date_of_cancellation: string;
  status: string;
  days_remaning: string;
  contact_no: string;
  units: string;
  profile: string;
  remark: string;
  dates: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  is_archived: boolean;
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
    return new Blob(); // Placeholder
  }
}
