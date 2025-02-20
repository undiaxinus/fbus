import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-8">
      <!-- Header Section -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600 mt-1">Stay updated with your bond-related notifications</p>
        </div>
        <div class="flex space-x-3">
          <button class="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button class="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button *ngFor="let tab of tabs" 
                  (click)="activeTab = tab.id"
                  [class]="getTabClass(tab.id)">
            {{tab.name}}
            <span [class]="getTabCountClass(tab.id)"
                  class="ml-2 py-0.5 px-2 rounded-full text-xs font-medium">
              {{getNotificationCount(tab.id)}}
            </span>
          </button>
        </nav>
      </div>

      <!-- Notifications List -->
      <div class="space-y-4">
        <div *ngFor="let notification of filteredNotifications" 
             class="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors"
             [class.bg-blue-50]="!notification.read">
          <div class="flex items-start space-x-4">
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
                  <div class="mt-2 flex items-center space-x-4">
                    <span class="text-xs text-gray-500">{{notification.time}}</span>
                    <button *ngIf="notification.actionRequired" 
                            class="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Take Action
                    </button>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button *ngIf="!notification.read" 
                          class="text-sm text-gray-600 hover:text-gray-700 font-medium">
                    Mark as read
                  </button>
                  <button class="text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserNotificationsComponent {
  activeTab = 'all';

  tabs = [
    { id: 'all', name: 'All' },
    { id: 'unread', name: 'Unread' },
    { id: 'requests', name: 'Requests' },
    { id: 'updates', name: 'Updates' }
  ];

  notifications = [
    {
      id: 1,
      type: 'request',
      title: 'Bond Request Approved',
      message: 'Your bond request (REQ-2024-001) has been approved.',
      time: '2 hours ago',
      read: false,
      actionRequired: true
    },
    {
      id: 2,
      type: 'expiry',
      title: 'Bond Expiring Soon',
      message: 'Your bond FB-2024-002 will expire in 30 days. Please submit a renewal request.',
      time: '1 day ago',
      read: true,
      actionRequired: true
    },
    {
      id: 3,
      type: 'update',
      title: 'Document Update Required',
      message: 'Please update your employment certificate for bond renewal.',
      time: '2 days ago',
      read: false,
      actionRequired: true
    },
    {
      id: 4,
      type: 'info',
      title: 'System Maintenance',
      message: 'The system will undergo maintenance on Saturday, 10 PM - 12 AM.',
      time: '3 days ago',
      read: true,
      actionRequired: false
    }
  ];

  get filteredNotifications() {
    switch (this.activeTab) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'requests':
        return this.notifications.filter(n => n.type === 'request');
      case 'updates':
        return this.notifications.filter(n => n.type === 'update');
      default:
        return this.notifications;
    }
  }

  getNotificationCount(tabId: string): number {
    switch (tabId) {
      case 'unread':
        return this.notifications.filter(n => !n.read).length;
      case 'requests':
        return this.notifications.filter(n => n.type === 'request').length;
      case 'updates':
        return this.notifications.filter(n => n.type === 'update').length;
      default:
        return this.notifications.length;
    }
  }

  getTabClass(tabId: string): string {
    const baseClass = 'flex items-center px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap';
    return this.activeTab === tabId
      ? `${baseClass} border-blue-500 text-blue-600`
      : `${baseClass} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  getTabCountClass(tabId: string): string {
    return this.activeTab === tabId
      ? 'bg-blue-100 text-blue-600'
      : 'bg-gray-100 text-gray-900';
  }

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
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'expiry':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'update':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
} 