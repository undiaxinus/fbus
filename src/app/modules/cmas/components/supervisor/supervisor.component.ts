import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p class="text-gray-600">Monitor and manage team performance</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Team Overview -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Team Overview</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total Team Members</span>
              <span class="text-lg font-semibold text-gray-900">12</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Active Now</span>
              <span class="text-lg font-semibold text-green-600">8</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">On Leave</span>
              <span class="text-lg font-semibold text-yellow-600">2</span>
            </div>
            <button routerLink="team" class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Team Details
            </button>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Task Completion Rate</span>
              <span class="text-lg font-semibold text-green-600">95%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Average Response Time</span>
              <span class="text-lg font-semibold text-blue-600">15 min</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Team Efficiency</span>
              <span class="text-lg font-semibold text-purple-600">87%</span>
            </div>
            <button routerLink="performance" class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              View Performance
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="space-y-4">
            <button routerLink="team" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">Manage Team</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button routerLink="performance" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">View Performance</span>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button routerLink="reports" class="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
              <span class="font-medium text-gray-700">Generate Reports</span>
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
export class SupervisorComponent {} 