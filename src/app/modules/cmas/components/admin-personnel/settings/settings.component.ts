import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
        <p class="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-6">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
          <div class="p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">System Notifications</h3>
                <p class="text-sm text-gray-500">Enable or disable system-wide notifications</p>
              </div>
              <button class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600">
                <span class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                <p class="text-sm text-gray-500">Put system in maintenance mode</p>
              </div>
              <button class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-200">
                <span class="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>
          <div class="p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p class="text-sm text-gray-500">Require 2FA for all admin users</p>
              </div>
              <button class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600">
                <span class="translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-900">Session Timeout</h3>
                <p class="text-sm text-gray-500">Set session timeout duration</p>
              </div>
              <select class="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {} 