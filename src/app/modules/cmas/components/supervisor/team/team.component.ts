import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Team Management</h1>
        <p class="text-gray-600">Manage and monitor your team members</p>
      </div>

      <!-- Team Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Total Members</h3>
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">12</p>
          <p class="text-sm text-gray-500">Active team members</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Tasks</h3>
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">25</p>
          <p class="text-sm text-gray-500">Active tasks</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Performance</h3>
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">92%</p>
          <p class="text-sm text-gray-500">Average performance</p>
        </div>
      </div>

      <!-- Team Members List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Team Members</h2>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Member
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    JS
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">John Smith</h3>
                    <p class="text-xs text-gray-500">Field Personnel</p>
                    <div class="flex items-center mt-1">
                      <span class="text-xs text-gray-500">Status:</span>
                      <span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        On Duty
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="p-2 text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
export class TeamComponent {} 