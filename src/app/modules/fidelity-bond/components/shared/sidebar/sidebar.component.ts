import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col h-screen bg-[#1e1e2d] shadow-xl">
      <!-- Logo Section -->
      <div class="py-6 px-5">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-lg">
            <img src="assets/logo.png" alt="Logo" class="h-8 w-8">
          </div>
          <span class="text-xl font-bold text-white tracking-wide">Fidelity Bond</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6">
        <!-- Menu Section -->
        <div class="mb-4 px-2">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</h2>
        </div>
        
        <ul class="space-y-1.5">
          <li *ngFor="let item of menuItems">
            <a [routerLink]="item.route"
               routerLinkActive="bg-[#2a2a3c] text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-500 before:rounded-r"
               [routerLinkActiveOptions]="{exact: item.route.endsWith('dashboard')}"
               class="flex items-center px-3 py-2.5 text-gray-400 hover:text-white rounded-lg relative overflow-hidden hover:bg-[#2a2a3c] transition-all duration-300 group">
              <div class="flex items-center w-full relative z-10">
                <div class="p-2 rounded-lg bg-[#1e1e2d] group-hover:bg-white/5 transition-colors duration-300">
                  <svg class="h-[22px] w-[22px] transform group-hover:scale-110 transition-all duration-300" 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="1.75" 
                          [attr.d]="item.icon"/>
                  </svg>
                </div>
                <span class="ml-3 font-medium tracking-wide text-sm group-hover:translate-x-1 transition-transform duration-300">
                  {{ item.title }}
                </span>
              </div>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Footer Section -->
      <div class="px-4 pb-6">
        <div class="px-2 mb-3">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</h2>
        </div>
        <!-- Logout Button -->
        <button (click)="logout()" 
                class="w-full flex items-center px-3 py-2.5 text-gray-400 hover:text-white rounded-lg relative overflow-hidden hover:bg-[#2a2a3c] transition-all duration-300 group">
          <div class="flex items-center w-full relative z-10">
            <div class="p-2 rounded-lg bg-[#1e1e2d] group-hover:bg-red-500/10 transition-colors duration-300">
              <svg class="h-[22px] w-[22px] transform group-hover:scale-110 transition-all duration-300" 
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24">
                <path stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="1.75" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
            <span class="ml-3 font-medium tracking-wide text-sm group-hover:translate-x-1 transition-transform duration-300">
              Logout
            </span>
          </div>
        </button>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentUser: { name: string; role: string; } | null = null;

  private adminMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/fidelity-bond/admin/dashboard'
    },
    {
      title: 'User Management',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/fidelity-bond/admin/users'
    },
    {
      title: 'Bond Management',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: '/fidelity-bond/admin/bonds'
    },
    {
      title: 'Unit Management',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      route: '/fidelity-bond/admin/units'
    },
    {
      title: 'Notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      route: '/fidelity-bond/admin/notifications'
    }
  ];

  private userMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/fidelity-bond/user/dashboard'
    },
    {
      title: 'My Bonds',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: '/fidelity-bond/user/bonds'
    },
    {
      title: 'Requests',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      route: '/fidelity-bond/user/requests'
    },
    {
      title: 'Notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      route: '/fidelity-bond/user/notifications'
    },
    {
      title: 'Profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      route: '/fidelity-bond/user/profile'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.menuItems = this.currentUser?.role === 'fbus_admin' ? this.adminMenuItems : this.userMenuItems;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.redirectToLogin();
      }
    } else {
      this.redirectToLogin();
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.redirectToLogin();
  }

  private redirectToLogin() {
    this.router.navigate(['/fidelity-bond/login']);
  }
} 