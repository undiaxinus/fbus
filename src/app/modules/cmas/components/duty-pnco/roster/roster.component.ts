import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-duty-roster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Duty Roster</h1>
        <p class="text-gray-600">Manage and view duty assignments</p>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white rounded-lg shadow">
        <!-- Calendar Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">February 2024</h2>
            <div class="flex space-x-2">
              <button class="p-2 hover:bg-gray-100 rounded-full">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button class="p-2 hover:bg-gray-100 rounded-full">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="p-6">
          <!-- Days of Week -->
          <div class="grid grid-cols-7 gap-4 mb-4">
            <div class="text-sm font-medium text-gray-500 text-center">Sun</div>
            <div class="text-sm font-medium text-gray-500 text-center">Mon</div>
            <div class="text-sm font-medium text-gray-500 text-center">Tue</div>
            <div class="text-sm font-medium text-gray-500 text-center">Wed</div>
            <div class="text-sm font-medium text-gray-500 text-center">Thu</div>
            <div class="text-sm font-medium text-gray-500 text-center">Fri</div>
            <div class="text-sm font-medium text-gray-500 text-center">Sat</div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-4">
            <!-- Example Days -->
            <div class="min-h-[100px] border rounded-lg p-2">
              <div class="text-sm text-gray-500">1</div>
              <div class="mt-2 text-xs">
                <div class="bg-blue-100 text-blue-800 rounded p-1 mb-1">John D.</div>
                <div class="bg-green-100 text-green-800 rounded p-1">Mary S.</div>
              </div>
            </div>
            <!-- Repeat for other days -->
          </div>
        </div>
      </div>

      <!-- Duty Assignment List -->
      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Today's Duties</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <div>
                  <p class="font-medium text-gray-900">John Doe</p>
                  <p class="text-sm text-gray-500">Morning Shift (0600-1400)</p>
                </div>
              </div>
              <span class="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">Active</span>
            </div>
            <!-- Add more duty assignments -->
          </div>
        </div>
      </div>
    </div>
  `
})
export class DutyRosterComponent {} 