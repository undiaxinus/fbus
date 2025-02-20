import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UnitOffice {
  id: number;
  unit: string;
  unit_office: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitOfficeService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  getUnitOffices(): Observable<UnitOffice[]> {
    return from(
      this.supabase
        .from('fbus_unit_office')
        .select('*')
        .then(({ data, error }) => {
          if (error) throw error;
          return data as UnitOffice[];
        })
    );
  }

  async addUnitOffice(unitOffice: Omit<UnitOffice, 'id'>): Promise<UnitOffice> {
    const { data, error } = await this.supabase
      .from('fbus_unit_office')
      .insert([unitOffice])
      .select()
      .single();

    if (error) throw error;
    return data as UnitOffice;
  }

  async updateUnitOffice(id: number, updates: Partial<UnitOffice>): Promise<UnitOffice> {
    const { data, error } = await this.supabase
      .from('fbus_unit_office')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UnitOffice;
  }

  async deleteUnitOffice(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('fbus_unit_office')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}