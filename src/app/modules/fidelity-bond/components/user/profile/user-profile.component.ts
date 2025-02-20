import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6 space-y-8">
      <!-- Header Section -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
        <p class="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <!-- Profile Information -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          <form [formGroup]="profileForm" class="space-y-6">
            <!-- Profile Picture -->
            <div class="flex items-center space-x-6">
              <div class="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <svg *ngIf="!profilePicture" class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <img *ngIf="profilePicture" [src]="profilePicture" alt="Profile picture" class="h-full w-full object-cover">
              </div>
              <div>
                <button type="button" class="btn-secondary px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                  Change Photo
                </button>
                <p class="mt-2 text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB</p>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" formControlName="firstName"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" formControlName="lastName"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" formControlName="email"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" formControlName="phone"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
            </div>

            <!-- Employment Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <input type="text" formControlName="department"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Position</label>
                <input type="text" formControlName="position"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Employee ID</label>
                <input type="text" formControlName="employeeId"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date Joined</label>
                <input type="date" formControlName="dateJoined"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button type="submit" 
                      [disabled]="!profileForm.valid || !profileForm.dirty"
                      class="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
          <form [formGroup]="securityForm" class="space-y-6">
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" formControlName="currentPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" formControlName="newPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" formControlName="confirmPassword"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button type="submit" 
                      [disabled]="!securityForm.valid || !securityForm.dirty"
                      class="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          <form [formGroup]="notificationForm" class="space-y-6">
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input type="checkbox" formControlName="emailNotifications"
                         class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                </div>
                <div class="ml-3">
                  <label class="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p class="text-sm text-gray-500">Receive notifications about your bond status via email</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input type="checkbox" formControlName="smsNotifications"
                         class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                </div>
                <div class="ml-3">
                  <label class="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p class="text-sm text-gray-500">Receive notifications about your bond status via SMS</p>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button type="submit" 
                      [disabled]="!notificationForm.valid || !notificationForm.dirty"
                      class="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  profilePicture: string | null = null;
  profileForm: FormGroup;
  securityForm: FormGroup;
  notificationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['+1234567890', Validators.required],
      department: ['Finance', Validators.required],
      position: ['Financial Analyst', Validators.required],
      employeeId: ['EMP001', Validators.required],
      dateJoined: ['2023-01-01', Validators.required]
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false]
    });
  }
} 