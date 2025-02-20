import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-8">
      <!-- Header Section -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Requests</h1>
          <p class="text-gray-600 mt-1">Track and manage your bond requests</p>
        </div>
        <button class="btn-primary flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>New Request</span>
        </button>
      </div>

      <!-- Active Requests Section -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Active Requests</h2>
          <div class="space-y-4">
            <div *ngFor="let request of activeRequests" 
                 class="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div class="flex justify-between items-start">
                <div>
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                        [class]="getRequestStatusClass(request.status)">
                    {{request.status}}
                  </span>
                  <h3 class="text-lg font-medium text-gray-900 mt-2">{{request.requestId}}</h3>
                  <p class="text-gray-500 text-sm mt-1">{{request.type}}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">₱{{request.amount.toLocaleString()}}</p>
                  <p class="text-sm text-gray-500 mt-1">Requested Amount</p>
                </div>
              </div>
              
              <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p class="text-gray-500">Submission Date</p>
                  <p class="font-medium text-gray-900">{{request.submissionDate}}</p>
                </div>
                <div>
                  <p class="text-gray-500">Position</p>
                  <p class="font-medium text-gray-900">{{request.position}}</p>
                </div>
                <div>
                  <p class="text-gray-500">Department</p>
                  <p class="font-medium text-gray-900">{{request.department}}</p>
                </div>
              </div>

              <div *ngIf="request.status === 'pending'" class="mt-4 p-4 bg-yellow-50 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-yellow-800">Awaiting Approval</h4>
                    <p class="text-sm text-yellow-700 mt-1">Your request is being reviewed by the appropriate authorities.</p>
                  </div>
                </div>
              </div>

              <div *ngIf="request.status === 'rejected'" class="mt-4 p-4 bg-red-50 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-red-800">Request Rejected</h4>
                    <p class="text-sm text-red-700 mt-1">{{request.rejectionReason}}</p>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View Details</button>
                <button *ngIf="request.status === 'rejected'" 
                        class="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Resubmit
                </button>
                <button *ngIf="request.status === 'pending'" 
                        class="text-sm text-red-600 hover:text-red-700 font-medium">
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request History -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Request History</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let request of requestHistory">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{request.requestId}}</div>
                    <div class="text-sm text-gray-500">{{request.position}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{request.type}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">₱{{request.amount.toLocaleString()}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{request.submissionDate}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class]="getRequestStatusClass(request.status)">
                      {{request.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserRequestsComponent {
  activeRequests = [
    {
      requestId: 'REQ-2024-001',
      type: 'New Bond',
      amount: 100000,
      position: 'Financial Analyst',
      department: 'Finance',
      submissionDate: '2024-02-15',
      status: 'pending'
    },
    {
      requestId: 'REQ-2024-002',
      type: 'Bond Renewal',
      amount: 150000,
      position: 'Senior Accountant',
      department: 'Finance',
      submissionDate: '2024-02-10',
      status: 'rejected',
      rejectionReason: 'Insufficient supporting documents. Please provide updated employment certificate.'
    }
  ];

  requestHistory = [
    {
      requestId: 'REQ-2023-001',
      type: 'New Bond',
      amount: 80000,
      position: 'Junior Accountant',
      submissionDate: '2023-06-01',
      status: 'approved'
    },
    {
      requestId: 'REQ-2023-002',
      type: 'Bond Renewal',
      amount: 100000,
      position: 'Financial Analyst',
      submissionDate: '2023-12-01',
      status: 'approved'
    }
  ];

  getRequestStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 