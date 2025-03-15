import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Role Management</h1>
        <p class="text-gray-600">Manage system roles and their permissions</p>
      </div>

      <!-- Actions Bar -->
      <div class="mb-6 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" 
                   placeholder="Search roles..."
                   class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   [(ngModel)]="searchQuery">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <select class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [(ngModel)]="statusFilter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>Create Role</span>
        </button>
      </div>

      <!-- Roles List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let role of filteredRoles">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ role.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ role.users }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusClass(role.status)">
                  {{ role.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ role.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RolesComponent {
  searchQuery: string = '';
  statusFilter: string = 'all';

  roles: Role[] = [
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access and control',
      permissions: ['all'],
      users: 3,
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Supervisor',
      description: 'Team management and reporting',
      permissions: ['manage_team', 'view_reports'],
      users: 8,
      createdAt: '2024-01-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Field Personnel',
      description: 'Field operations and data collection',
      permissions: ['field_ops', 'data_entry'],
      users: 25,
      createdAt: '2024-02-01',
      status: 'active'
    },
    {
      id: '4',
      name: 'Guest',
      description: 'Limited system access',
      permissions: ['view_only'],
      users: 5,
      createdAt: '2024-02-10',
      status: 'inactive'
    }
  ];

  get filteredRoles(): Role[] {
    return this.roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          role.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || role.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
    return status === 'active'
      ? baseClasses + 'bg-green-100 text-green-800'
      : baseClasses + 'bg-red-100 text-red-800';
  }
} 