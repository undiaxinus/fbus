import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface NavItem {
  title: string;
  route: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
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
          <span class="text-xl font-bold text-white tracking-wide">CMS</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6">
        <!-- Menu Sections -->
        <div *ngIf="getRoleBasedSections().length > 0">
          <div *ngFor="let section of getRoleBasedSections()" class="mb-6">
            <div class="mb-4 px-2">
              <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">{{section.title}}</h2>
            </div>
            
            <ul class="space-y-1.5">
              <li *ngFor="let item of section.items">
                <a [routerLink]="[item.route]"
                   routerLinkActive="bg-[#2a2a3c] text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-500 before:rounded-r"
                   [routerLinkActiveOptions]="{exact: true}"
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
                              [attr.d]="getIconPath(item.icon)"/>
                      </svg>
                    </div>
                    <span class="ml-3 font-medium tracking-wide text-sm group-hover:translate-x-1 transition-transform duration-300">
                      {{ item.title }}
                    </span>
                    <span *ngIf="item.badge" 
                          class="ml-auto bg-blue-500/10 text-blue-500 text-xs font-medium px-2 py-0.5 rounded-full">
                      {{item.badge}}
                    </span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div *ngIf="getRoleBasedSections().length === 0" class="px-3 py-4 text-gray-400">
          <p>No navigation items available for this role.</p>
          <p class="mt-2 text-sm">Current role: {{currentRole || 'Not set'}}</p>
        </div>
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
  @Input() currentRole: string = '';
  @Input() userName: string = '';
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Make sure we have the current role and username
    if ((!this.currentRole || !this.userName) && this.isBrowser) {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          this.currentRole = user.role || user.system_role || '';
          this.userName = user.name || user.username || 'User';
          console.log('Current user role:', this.currentRole);
        }
      } catch (error) {
        console.error('Error accessing or parsing currentUser from localStorage:', error);
      }
    }
  }

  adminSections: NavSection[] = [
    {
      title: 'Communication Monitoring System',
      items: [
        { title: 'Dashboard', route: '/cmas/admin-personnel', icon: 'home' }
      ]
    },
    {
      title: 'User Management',
      items: [
        { title: 'Users', route: '/cmas/admin-personnel/users', icon: 'users', badge: 156 },
        { title: 'Roles', route: '/cmas/admin-personnel/roles', icon: 'user-group' },
        { title: 'Permissions', route: '/cmas/admin-personnel/permissions', icon: 'shield-check' }
      ]
    },
    {
      title: 'System',
      items: [
        { title: 'Settings', route: '/cmas/admin-personnel/settings', icon: 'cog' },
        { title: 'Security', route: '/cmas/admin-personnel/security', icon: 'lock-closed' },
        { title: 'Audit Logs', route: '/cmas/admin-personnel/logs', icon: 'document-report' }
      ]
    }
  ];

  roleBasedNavigation: { [key: string]: NavSection[] } = {
    duty_pnco: [
      {
        title: 'Communication Monitoring System',
        items: [
          { title: 'Dashboard', route: '/cmas/duty-pnco', icon: 'home' }
        ]
      },
      {
        title: 'Duty Management',
        items: [
          { title: 'Duty Roster', route: '/cmas/duty-pnco/roster', icon: 'calendar' },
          { title: 'Schedules', route: '/cmas/duty-pnco/schedules', icon: 'clock' },
          { title: 'Assignments', route: '/cmas/duty-pnco/assignments', icon: 'clipboard-check' }
        ]
      },
      {
        title: 'Communication',
        items: [
          { title: 'Messages', route: '/cmas/duty-pnco/messages', icon: 'chat-alt' },
          { title: 'Reports', route: '/cmas/duty-pnco/reports', icon: 'document-text' },
          { title: 'Alerts', route: '/cmas/duty-pnco/alerts', icon: 'bell' }
        ]
      }
    ],
    section_personnel: [
      {
        title: 'Communication Monitoring System',
        items: [
          { title: 'Dashboard', route: '/cmas/section-personnel', icon: 'home' }
        ]
      },
      {
        title: 'Task Management',
        items: [
          { title: 'Tasks', route: '/cmas/section-personnel/tasks', icon: 'clipboard-list' },
          { title: 'Documents', route: '/cmas/section-personnel/documents', icon: 'folder' },
          { title: 'Approvals', route: '/cmas/section-personnel/approvals', icon: 'check-circle' }
        ]
      },
      {
        title: 'Team',
        items: [
          { title: 'Members', route: '/cmas/section-personnel/team', icon: 'users' },
          { title: 'Schedule', route: '/cmas/section-personnel/schedule', icon: 'calendar' },
          { title: 'Messaging', route: '/cmas/section-personnel/messaging', icon: 'chat' }
        ]
      }
    ],
    field_personnel: [
      {
        title: 'Communication Monitoring System',
        items: [
          { title: 'Dashboard', route: '/cmas/field-personnel', icon: 'home' }
        ]
      },
      {
        title: 'Field Operations',
        items: [
          { title: 'Tasks', route: '/cmas/field-personnel/tasks', icon: 'clipboard-check' },
          { title: 'Location', route: '/cmas/field-personnel/location', icon: 'map' },
          { title: 'Equipment', route: '/cmas/field-personnel/equipment', icon: 'device-mobile' }
        ]
      },
      {
        title: 'Reporting',
        items: [
          { title: 'Daily Reports', route: '/cmas/field-personnel/reports', icon: 'document-text' },
          { title: 'Incidents', route: '/cmas/field-personnel/incidents', icon: 'exclamation' },
          { title: 'Status Updates', route: '/cmas/field-personnel/status', icon: 'refresh' }
        ]
      }
    ],
    supervisor: [
      {
        title: 'Communication Monitoring System',
        items: [
          { title: 'Dashboard', route: '/cmas/supervisor', icon: 'home' }
        ]
      },
      {
        title: 'Team Management',
        items: [
          { title: 'Team Overview', route: '/cmas/supervisor/team', icon: 'users' },
          { title: 'Assignments', route: '/cmas/supervisor/assignments', icon: 'clipboard-list' },
          { title: 'Approvals', route: '/cmas/supervisor/approvals', icon: 'check' }
        ]
      },
      {
        title: 'Monitoring',
        items: [
          { title: 'Performance', route: '/cmas/supervisor/performance', icon: 'chart-bar' },
          { title: 'Reports', route: '/cmas/supervisor/reports', icon: 'document-report' },
          { title: 'Analytics', route: '/cmas/supervisor/analytics', icon: 'chart-pie' }
        ]
      }
    ]
  };

  getRoleBasedSections(): NavSection[] {
    // Check for admin role first
    if (this.currentRole === 'cmas_admin') {
      return this.adminSections;
    }
    
    // If we have defined navigation for this role, return it
    if (this.roleBasedNavigation[this.currentRole]) {
      return this.roleBasedNavigation[this.currentRole];
    }
    
    // For any undefined roles, return an empty array
    // We could also provide a default navigation for unknown roles here
    console.warn(`Navigation not defined for role: ${this.currentRole}`);
    return [];
  }

  getIconPath(icon: string): string {
    const iconPaths: { [key: string]: string } = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'clipboard-list': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'user-group': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'shield-check': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'lock-closed': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'clipboard-check': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      map: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      'chart-bar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'document-report': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      exclamation: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      'chat-alt': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      check: 'M5 13l4 4L19 7',
      'device-mobile': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'chart-pie': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z'
    };
    return iconPaths[icon] || '';
  }

  logout() {
    this.authService.logout();
  }
} 