import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <button (click)="showAddUserModal = true" class="btn-primary flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>Add New User</span>
        </button>
      </div>

      <!-- User List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">{{user.name.charAt(0)}}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{user.name}}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{user.username}}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getRoleClass(user.role)">
                  {{user.role}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                <button (click)="deleteUser(user.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add User Modal -->
      <div *ngIf="showAddUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New User</h3>
            <form (ngSubmit)="addUser()">
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input type="text" [(ngModel)]="newUser.name" name="name"
                       class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input type="email" [(ngModel)]="newUser.username" name="username"
                       class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input type="password" [(ngModel)]="newUser.password" name="password"
                       class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              </div>
              <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select [(ngModel)]="newUser.role" name="role"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="fbus_admin">Admin</option>
                  <option value="fbus_user">User</option>
                </select>
              </div>
              <div class="flex justify-end space-x-3">
                <button type="button" (click)="showAddUserModal = false"
                        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  showAddUserModal = false;
  newUser: any = {
    name: '',
    username: '',
    password: '',
    role: 'fbus_user',
    system_role: 'fidelity-bond'
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(
      users => {
        this.users = users.filter(user => user.system_role === 'fidelity-bond');
      },
      error => {
        console.error('Error loading users:', error);
        // Handle error (show notification, etc.)
      }
    );
  }

  async addUser() {
    try {
      const result = await this.userService.createUser(this.newUser);
      if (result) {
        this.showAddUserModal = false;
        this.loadUsers();
        this.resetNewUser();
        // Show success message
      }
    } catch (error) {
      console.error('Error adding user:', error);
      // Show error message
    }
  }

  async deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const success = await this.userService.deleteUser(id);
        if (success) {
          this.loadUsers();
          // Show success message
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // Show error message
      }
    }
  }

  editUser(user: User) {
    // Implement edit functionality
    console.log('Edit user:', user);
  }

  getRoleClass(role: string): string {
    return role === 'fbus_admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-green-100 text-green-800';
  }

  private resetNewUser() {
    this.newUser = {
      name: '',
      username: '',
      password: '',
      role: 'fbus_user',
      system_role: 'fidelity-bond'
    };
  }
} 