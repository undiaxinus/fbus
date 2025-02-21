import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-section-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Section Personnel Dashboard</h1>
        <p class="text-gray-600">Manage section tasks and team activities</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <button routerLink="documents" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">Access Documents</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Task Overview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Task Overview</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total Tasks</span>
              <span class="text-lg font-semibold text-gray-900">12</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Completed</span>
              <span class="text-lg font-semibold text-green-600">8</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">In Progress</span>
              <span class="text-lg font-semibold text-yellow-600">4</span>
            </div>
          </div>
        </div>

        <!-- Team Status -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Team Status</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span class="text-sm text-gray-600">8 Members Active</span>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span class="text-sm text-gray-600">2 On Leave</span>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              <span class="text-sm text-gray-600">1 Off Duty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SectionPersonnelComponent {} 