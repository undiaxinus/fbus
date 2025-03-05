import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable } from 'rxjs';

export interface SmsHistory {
  id: number;
  recipient_name: string;
  contact_no: string;
  message: string;
  days_remaining: number;
  sent_at: Date;
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SmsHistoryService {
  constructor(private supabase: SupabaseService) {}

  getSmsHistory(): Observable<SmsHistory[]> {
    return new Observable((observer) => {
      this.fetchSmsHistory(observer);
    });
  }

  private async fetchSmsHistory(observer: any) {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('sms_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        observer.error(error);
        return;
      }

      observer.next(data);
      observer.complete();
    } catch (error) {
      observer.error(error);
    }
  }
} 