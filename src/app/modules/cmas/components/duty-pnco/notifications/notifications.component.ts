import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Duty Notifications</h1>
        <p class="text-gray-600">View and manage duty-related notifications</p>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Recent Notifications</h2>
            <div class="flex space-x-2">
              <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Mark All Read
              </button>
              <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Settings
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <!-- Unread Notification -->
            <div class="border rounded-lg p-4 bg-blue-50">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">New Duty Assignment</h3>
                    <span class="text-xs text-gray-500">5 minutes ago</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">You have been assigned to evening duty on March 1st, 2024.</p>
                  <div class="mt-2 flex space-x-2">
                    <button class="text-xs text-blue-600 hover:text-blue-800">View Details</button>
                    <button class="text-xs text-gray-500 hover:text-gray-700">Mark as Read</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Read Notification -->
            <div class="border rounded-lg p-4">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">Duty Report Approved</h3>
                    <span class="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">Your duty report for February 25th has been approved.</p>
                  <div class="mt-2">
                    <button class="text-xs text-blue-600 hover:text-blue-800">View Report</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent {} 