import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-bonds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 space-y-8">
      <!-- Header Section -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Bonds</h1>
          <p class="text-gray-600 mt-1">Manage your active and historical bonds</p>
        </div>
        <button class="btn-primary flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>Request New Bond</span>
        </button>
      </div>

      <!-- Active Bonds Section -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Active Bonds</h2>
          <div class="grid gap-6">
            <div *ngFor="let bond of activeBonds" 
                 class="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div class="flex justify-between items-start">
                <div>
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                        [class]="getBondStatusClass(bond.status)">
                    {{bond.status}}
                  </span>
                  <h3 class="text-lg font-medium text-gray-900 mt-2">{{bond.bondId}}</h3>
                  <p class="text-gray-500 text-sm mt-1">{{bond.position}}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">₱{{bond.amount.toLocaleString()}}</p>
                  <p class="text-sm text-gray-500 mt-1">Coverage Amount</p>
                </div>
              </div>
              
              <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-500">Issue Date</p>
                  <p class="font-medium text-gray-900">{{bond.issueDate}}</p>
                </div>
                <div>
                  <p class="text-gray-500">Expiry Date</p>
                  <p class="font-medium text-gray-900">{{bond.expiryDate}}</p>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View Details</button>
                <button class="text-sm text-green-600 hover:text-green-700 font-medium">Download Certificate</button>
                <button *ngIf="shouldShowRenewal(bond)" 
                        class="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Renew Bond
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bond History Section -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Bond History</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bond ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let bond of bondHistory">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{bond.bondId}}</div>
                    <div class="text-sm text-gray-500">{{bond.position}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">₱{{bond.amount.toLocaleString()}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{bond.issueDate}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{bond.expiryDate}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [class]="getBondStatusClass(bond.status)">
                      {{bond.status}}
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
export class UserBondsComponent {
  activeBonds = [
    {
      bondId: 'FB-2024-001',
      position: 'Financial Analyst',
      amount: 100000,
      issueDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'active'
    },
    {
      bondId: 'FB-2024-002',
      position: 'Senior Accountant',
      amount: 150000,
      issueDate: '2024-01-15',
      expiryDate: '2024-04-15',
      status: 'expiring'
    }
  ];

  bondHistory = [
    {
      bondId: 'FB-2023-001',
      position: 'Financial Analyst',
      amount: 80000,
      issueDate: '2023-01-01',
      expiryDate: '2023-12-31',
      status: 'expired'
    },
    {
      bondId: 'FB-2023-002',
      position: 'Junior Accountant',
      amount: 50000,
      issueDate: '2023-06-01',
      expiryDate: '2023-12-31',
      status: 'expired'
    }
  ];

  getBondStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  shouldShowRenewal(bond: any): boolean {
    if (bond.status === 'expiring') {
      const expiryDate = new Date(bond.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30;
    }
    return false;
  }
} 