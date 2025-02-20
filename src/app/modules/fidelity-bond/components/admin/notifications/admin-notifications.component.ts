import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
        <div class="flex space-x-3">
          <button class="text-gray-600 hover:text-gray-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button class="text-gray-600 hover:text-gray-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="space-y-4">
        <div *ngFor="let notification of notifications" 
             class="bg-white rounded-lg shadow p-4 flex items-start space-x-4">
          <!-- Icon -->
          <div [class]="'p-2 rounded-full ' + getIconBackground(notification.type)">
            <svg class="w-6 h-6" [class]="getIconColor(notification.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(notification.type)"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{notification.title}}</h3>
                <p class="text-sm text-gray-500 mt-1">{{notification.message}}</p>
              </div>
              <span class="text-xs text-gray-500">{{notification.time}}</span>
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-3 flex space-x-3">
              <button *ngIf="notification.type === 'request'" 
                      class="text-sm text-green-600 hover:text-green-700 font-medium">
                Approve
              </button>
              <button *ngIf="notification.type === 'request'" 
                      class="text-sm text-red-600 hover:text-red-700 font-medium">
                Reject
              </button>
              <button class="text-sm text-gray-600 hover:text-gray-700 font-medium">
                Mark as read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminNotificationsComponent {
  notifications = [
    {
      type: 'request',
      title: 'New Bond Request',
      message: 'John Doe has requested a new fidelity bond worth ₱100,000',
      time: '2 hours ago'
    },
    {
      type: 'expiry',
      title: 'Bond Expiring Soon',
      message: 'Sarah Wilson\'s bond will expire in 7 days',
      time: '5 hours ago'
    },
    {
      type: 'update',
      title: 'System Update',
      message: 'New features have been added to the bond management system',
      time: '1 day ago'
    }
  ];

  getIconBackground(type: string): string {
    switch (type) {
      case 'request':
        return 'bg-blue-50';
      case 'expiry':
        return 'bg-yellow-50';
      case 'update':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'request':
        return 'text-blue-500';
      case 'expiry':
        return 'text-yellow-500';
      case 'update':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  getIconPath(type: string): string {
    switch (type) {
      case 'request':
        return 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z';
      case 'expiry':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'update':
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
} 