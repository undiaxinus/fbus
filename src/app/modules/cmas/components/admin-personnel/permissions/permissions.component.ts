import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: string[];
  createdAt: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Permissions Management</h1>
        <p class="text-gray-600">Configure and manage system permissions</p>
      </div>

      <!-- Actions Bar -->
      <div class="mb-6 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input type="text" 
                   placeholder="Search permissions..."
                   class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   [(ngModel)]="searchQuery">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <select class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [(ngModel)]="categoryFilter">
            <option value="all">All Categories</option>
            <option *ngFor="let category of categories">{{ category }}</option>
          </select>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>Add Permission</span>
        </button>
      </div>

      <!-- Permissions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let permission of filteredPermissions" 
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div [class]="getCategoryColorClass(permission.category)"
                   class="w-10 h-10 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        [attr.d]="getCategoryIcon(permission.category)"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ permission.name }}</h3>
                <p class="text-sm text-gray-500">{{ permission.category }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <button class="text-gray-400 hover:text-gray-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <p class="text-sm text-gray-600 mb-4">{{ permission.description }}</p>
          
          <div class="border-t pt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Assigned Roles</span>
              <span class="font-medium text-gray-900">{{ permission.roles.length }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <span *ngFor="let role of permission.roles.slice(0, 3)" 
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {{ role }}
              </span>
              <span *ngIf="permission.roles.length > 3" 
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{{ permission.roles.length - 3 }} more
              </span>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <span [class]="getStatusClass(permission.status)">
              {{ permission.status }}
            </span>
            <div class="flex space-x-2">
              <button class="text-sm text-blue-600 hover:text-blue-800">Edit</button>
              <button class="text-sm text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PermissionsComponent {
  searchQuery: string = '';
  categoryFilter: string = 'all';

  categories: string[] = [
    'User Management',
    'System Settings',
    'Data Access',
    'Reports',
    'Security',
    'Communication'
  ];

  permissions: Permission[] = [
    {
      id: '1',
      name: 'Create Users',
      description: 'Ability to create new user accounts in the system',
      category: 'User Management',
      roles: ['Administrator', 'HR Manager'],
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'View Reports',
      description: 'Access to view system reports and analytics',
      category: 'Reports',
      roles: ['Administrator', 'Supervisor', 'Manager', 'Analyst'],
      createdAt: '2024-01-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Manage Settings',
      description: 'Configure system-wide settings and preferences',
      category: 'System Settings',
      roles: ['Administrator'],
      createdAt: '2024-02-01',
      status: 'active'
    },
    {
      id: '4',
      name: 'Delete Users',
      description: 'Ability to remove user accounts from the system',
      category: 'User Management',
      roles: ['Administrator'],
      createdAt: '2024-02-10',
      status: 'inactive'
    },
    {
      id: '5',
      name: 'Send Notifications',
      description: 'Send system-wide notifications to users',
      category: 'Communication',
      roles: ['Administrator', 'Communication Manager'],
      createdAt: '2024-02-15',
      status: 'active'
    },
    {
      id: '6',
      name: 'Access Logs',
      description: 'View system audit logs and security events',
      category: 'Security',
      roles: ['Administrator', 'Security Officer'],
      createdAt: '2024-02-20',
      status: 'active'
    }
  ];

  get filteredPermissions(): Permission[] {
    return this.permissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          permission.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.categoryFilter === 'all' || permission.category === this.categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full ';
    return status === 'active'
      ? baseClasses + 'bg-green-100 text-green-800'
      : baseClasses + 'bg-red-100 text-red-800';
  }

  getCategoryColorClass(category: string): string {
    const colors: { [key: string]: string } = {
      'User Management': 'bg-blue-600',
      'System Settings': 'bg-purple-600',
      'Data Access': 'bg-green-600',
      'Reports': 'bg-yellow-600',
      'Security': 'bg-red-600',
      'Communication': 'bg-indigo-600'
    };
    return colors[category] || 'bg-gray-600';
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'User Management': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'System Settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'Data Access': 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      'Reports': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'Security': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'Communication': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    };
    return icons[category] || 'M4 6h16M4 12h16M4 18h16';
  }
} 