import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Team Performance</h1>
        <p class="text-gray-600">Monitor and evaluate team performance metrics</p>
      </div>

      <!-- Performance Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Task Completion</h3>
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">95%</p>
          <p class="text-sm text-gray-500">Tasks completed on time</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Efficiency</h3>
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">87%</p>
          <p class="text-sm text-gray-500">Average efficiency rate</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Quality</h3>
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-gray-900">4.8/5</p>
          <p class="text-sm text-gray-500">Average quality rating</p>
        </div>
      </div>

      <!-- Individual Performance -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Individual Performance</h2>
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
                      <div class="flex items-center">
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="ml-1 text-xs text-gray-500">4.9/5</span>
                      </div>
                      <span class="mx-2">•</span>
                      <span class="text-xs text-gray-500">98% Task Completion</span>
                    </div>
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
export class PerformanceComponent {} 