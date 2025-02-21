import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600">System administration and management</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stats Cards -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-500">Total Users</h3>
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-2xl font-semibold text-gray-900">156</p>
          <p class="mt-1 text-sm text-green-600">142 active users</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-500">Pending Approvals</h3>
            <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-2xl font-semibold text-gray-900">8</p>
          <p class="mt-1 text-sm text-yellow-600">Requires attention</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-500">System Alerts</h3>
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-2xl font-semibold text-gray-900">3</p>
          <p class="mt-1 text-sm text-red-600">Active alerts</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-500">System Status</h3>
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-2xl font-semibold text-gray-900">Healthy</p>
          <p class="mt-1 text-sm text-green-600">All systems operational</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button routerLink="users" class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">Manage Users</h3>
              <p class="text-sm text-gray-500">Add, edit, or remove system users</p>
            </div>
          </div>
        </button>

        <button routerLink="settings" class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">Settings</h3>
              <p class="text-sm text-gray-500">Configure system settings</p>
            </div>
          </div>
        </button>

        <button routerLink="logs" class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">View Logs</h3>
              <p class="text-sm text-gray-500">Monitor system activity</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  `
})
export class AdminPersonnelComponent {} 