import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  value: boolean | string | number;
  type: 'toggle' | 'select' | 'input';
  options?: string[];
  category: string;
}

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p class="text-gray-600">Configure system security and access controls</p>
      </div>

      <!-- Security Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">System Status</h3>
              <p class="text-sm text-green-600">Secure</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Active Sessions</h3>
              <p class="text-sm text-blue-600">24 users</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Failed Logins</h3>
              <p class="text-sm text-yellow-600">3 attempts</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">Security Logs</h3>
              <p class="text-sm text-purple-600">Last 24h: 156</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings Sections -->
      <div class="space-y-6">
        <div *ngFor="let category of categories" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">{{ category }}</h2>
          </div>
          <div class="p-4 space-y-4">
            <div *ngFor="let setting of getSettingsByCategory(category)" 
                 class="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ setting.name }}</h3>
                <p class="text-sm text-gray-500">{{ setting.description }}</p>
              </div>
              
              <!-- Toggle Switch -->
              <div *ngIf="setting.type === 'toggle'" class="ml-4">
                <button [class]="getToggleClass(isSettingEnabled(setting))"
                        (click)="toggleSetting(setting)"
                        type="button"
                        role="switch"
                        [attr.aria-checked]="isSettingEnabled(setting)">
                  <span class="sr-only">Toggle {{ setting.name }}</span>
                  <span [class]="getToggleSwitchClass(isSettingEnabled(setting))"></span>
                </button>
              </div>

              <!-- Select Dropdown -->
              <div *ngIf="setting.type === 'select'" class="ml-4">
                <select class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        [(ngModel)]="setting.value">
                  <option *ngFor="let option of setting.options" [value]="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <!-- Input Field -->
              <div *ngIf="setting.type === 'input'" class="ml-4">
                <input type="text"
                       class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                       [(ngModel)]="setting.value">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Changes Button -->
      <div class="mt-6 flex justify-end">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  `
})
export class SecurityComponent {
  categories: string[] = [
    'Authentication',
    'Password Policy',
    'Session Management',
    'Access Control'
  ];

  securitySettings: SecuritySetting[] = [
    {
      id: '1',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all admin users',
      value: true,
      type: 'toggle',
      category: 'Authentication'
    },
    {
      id: '2',
      name: 'Password Expiration',
      description: 'Force password change after specified days',
      value: '90',
      type: 'select',
      options: ['30', '60', '90', '180', '365'],
      category: 'Password Policy'
    },
    {
      id: '3',
      name: 'Minimum Password Length',
      description: 'Set minimum required password length',
      value: 12,
      type: 'input',
      category: 'Password Policy'
    },
    {
      id: '4',
      name: 'Session Timeout',
      description: 'Automatically log out inactive users',
      value: '30',
      type: 'select',
      options: ['15', '30', '60', '120'],
      category: 'Session Management'
    },
    {
      id: '5',
      name: 'Failed Login Attempts',
      description: 'Maximum failed login attempts before account lock',
      value: 5,
      type: 'input',
      category: 'Authentication'
    },
    {
      id: '6',
      name: 'IP Whitelisting',
      description: 'Restrict access to specific IP addresses',
      value: false,
      type: 'toggle',
      category: 'Access Control'
    },
    {
      id: '7',
      name: 'Concurrent Sessions',
      description: 'Allow multiple active sessions per user',
      value: false,
      type: 'toggle',
      category: 'Session Management'
    },
    {
      id: '8',
      name: 'Password Complexity',
      description: 'Require mixed case, numbers, and special characters',
      value: true,
      type: 'toggle',
      category: 'Password Policy'
    }
  ];

  getSettingsByCategory(category: string): SecuritySetting[] {
    return this.securitySettings.filter(setting => setting.category === category);
  }

  isSettingEnabled(setting: SecuritySetting): boolean {
    return setting.type === 'toggle' && setting.value === true;
  }

  toggleSetting(setting: SecuritySetting): void {
    if (setting.type === 'toggle') {
      setting.value = !this.isSettingEnabled(setting);
    }
  }

  getToggleClass(enabled: boolean): string {
    return `${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`;
  }

  getToggleSwitchClass(enabled: boolean): string {
    return `${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`;
  }
} 