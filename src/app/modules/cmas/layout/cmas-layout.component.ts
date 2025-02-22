import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cmas-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-100">
      <!-- Sidebar -->
      <app-sidebar [currentRole]="userRole" [userName]="userName"></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation Bar -->
        <header class="bg-white shadow-sm h-16 flex-shrink-0">
          <div class="px-6 h-full flex items-center justify-between">
            <div>
              <!-- Left side - can be used for branding or navigation -->
            </div>
            <div class="flex items-center space-x-6">
              <!-- Notification Button -->
              <div class="relative">
                <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <!-- Notification badge - uncomment if needed -->
                  <!-- <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> -->
                </button>
              </div>
              
              <!-- User Profile -->
              <div class="flex items-center space-x-3">
                <div class="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {{userName.charAt(0).toUpperCase()}}
                </div>
                <span class="text-sm font-medium text-gray-700">{{userName}}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-gray-100 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class CmasLayoutComponent implements OnInit {
  userRole: string = '';
  userName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userRole = user.role;
      this.userName = user.name;
    }
  }
} 