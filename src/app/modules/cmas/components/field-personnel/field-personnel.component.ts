import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-field-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Field Personnel Dashboard</h1>
        <p class="text-gray-600">Manage field operations and tasks</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Current Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">On Duty</p>
                <p class="text-xs text-gray-500">Since 0600 hrs</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">Current Location</p>
                <p class="text-xs text-gray-500">Site A - Main Entrance</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Overview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Task Overview</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Assigned Tasks</span>
              <span class="text-lg font-semibold text-gray-900">5</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Completed Today</span>
              <span class="text-lg font-semibold text-green-600">3</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Pending</span>
              <span class="text-lg font-semibold text-yellow-600">2</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-4">
            <button routerLink="tasks" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">View Tasks</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button routerLink="reports" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">Submit Report</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button routerLink="location" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">Update Location</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FieldPersonnelComponent {} 