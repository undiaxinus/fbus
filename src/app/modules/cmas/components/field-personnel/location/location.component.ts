import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Location Tracking</h1>
        <p class="text-gray-600">Track and update your field location</p>
      </div>

      <!-- Location Status -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="p-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Current Location</h2>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Location
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Site A - Main Entrance</h3>
                <p class="text-xs text-gray-500">Last updated: 5 minutes ago</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-sm text-gray-500">Latitude</div>
                <div class="text-lg font-medium text-gray-900">1.3521° N</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-sm text-gray-500">Longitude</div>
                <div class="text-lg font-medium text-gray-900">103.8198° E</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location History -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Location History</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">Site B - Storage Area</h3>
                    <p class="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <button class="text-sm text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationComponent {} 