import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsHistoryService, SmsHistory } from '../../../../../core/services/sms-history.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Bond Expiration Alerts</h1>
        <div class="flex space-x-3">
          <!-- View All Button -->
      <div *ngIf="smsHistory.length > initialDisplayCount && !showAll" 
           class="mt-6 text-center">
        <button (click)="viewAll()" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          View All Alerts
          <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Show Less Button -->
      <div *ngIf="showAll && smsHistory.length > initialDisplayCount" 
           class="mt-6 text-center">
        <button (click)="showLess()" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Show Less
          <svg class="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
        </div>
      </div>

      <!-- Alert History List -->
      <div class="space-y-4">
        <div *ngFor="let alert of displayedAlerts" 
             class="bg-white rounded-lg shadow p-4 flex items-start space-x-4">
          <!-- Icon -->
          <div class="p-2 rounded-full bg-yellow-50">
            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{alert.recipient_name}}</h3>
                <p class="text-sm text-gray-600 mt-1">{{alert.contact_no}}</p>
                <p class="text-sm font-medium text-yellow-600 mt-1">{{alert.alert_status}}</p>
              </div>
              <span class="text-xs text-gray-500">{{alert.sent_at | date:'medium'}}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminNotificationsComponent implements OnInit {
  smsHistory: SmsHistory[] = [];
  displayedAlerts: SmsHistory[] = [];
  initialDisplayCount = 10;
  showAll = false;

  constructor(private smsHistoryService: SmsHistoryService) {}

  ngOnInit() {
    this.smsHistoryService.getSmsHistory().subscribe({
      next: (data) => {
        this.smsHistory = data;
        this.updateDisplayedAlerts();
      },
      error: (error) => {
        console.error('Error fetching SMS history:', error);
      }
    });
  }

  viewAll() {
    this.showAll = true;
    this.updateDisplayedAlerts();
  }

  showLess() {
    this.showAll = false;
    this.updateDisplayedAlerts();
  }

  private updateDisplayedAlerts() {
    this.displayedAlerts = this.showAll 
      ? this.smsHistory 
      : this.smsHistory.slice(0, this.initialDisplayCount);
  }
} 