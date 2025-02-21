import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Section Schedule</h1>
        <p class="mt-2 text-sm text-gray-600">Manage and view section personnel schedules</p>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-medium text-gray-900">Weekly Schedule</h2>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Schedule
            </button>
          </div>

          <!-- Schedule Grid -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">09:00 AM</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Team Meeting</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Field Work</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Training</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Field Work</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Reports</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">02:00 PM</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Field Work</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Training</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Field Work</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Team Meeting</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Planning</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScheduleComponent {} 