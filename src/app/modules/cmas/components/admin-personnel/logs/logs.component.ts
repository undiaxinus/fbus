import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">System Logs</h1>
        <p class="text-gray-600">View and analyze system activity logs</p>
      </div>

      <!-- Logs List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div class="flex space-x-2">
              <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Export
              </button>
              <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Filter
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">User Created</h3>
                    <span class="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">New user 'John Smith' was created by admin</p>
                  <div class="mt-2 text-xs text-gray-500">
                    IP: 192.168.1.100 • Browser: Chrome • OS: Windows
                  </div>
                </div>
              </div>
            </div>

            <div class="border rounded-lg p-4">
              <div class="flex items-start space-x-4">
                <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">Failed Login Attempt</h3>
                    <span class="text-xs text-gray-500">3 hours ago</span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">Multiple failed login attempts detected</p>
                  <div class="mt-2 text-xs text-gray-500">
                    IP: 192.168.1.105 • Browser: Firefox • OS: MacOS
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
export class LogsComponent {} 