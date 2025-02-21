import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface NavItem {
  title: string;
  route: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  @Input() currentRole: string = '';
  @Input() userName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (!this.currentRole || !this.userName) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        this.currentRole = user.role;
        this.userName = user.name;
      }
    }
  }

  adminSections: NavSection[] = [
    {
      title: 'Overview',
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
        title: 'Overview',
        items: [
          { title: 'Dashboard', route: '/cmas/duty-pnco', icon: 'home' },
          { title: 'Duty Roster', route: '/cmas/duty-pnco/roster', icon: 'calendar' },
          { title: 'Reports', route: '/cmas/duty-pnco/reports', icon: 'document-text' }
        ]
      }
    ],
    section_personnel: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', route: '/cmas/section-personnel', icon: 'home' },
          { title: 'Tasks', route: '/cmas/section-personnel/tasks', icon: 'clipboard-list' },
          { title: 'Documents', route: '/cmas/section-personnel/documents', icon: 'folder' }
        ]
      },
      {
        title: 'Team',
        items: [
          { title: 'Members', route: '/cmas/section-personnel/team', icon: 'users' },
          { title: 'Schedule', route: '/cmas/section-personnel/schedule', icon: 'calendar' }
        ]
      }
    ],
    field_personnel: [
      {
        title: 'Operations',
        items: [
          { title: 'Dashboard', route: '/cmas/field-personnel', icon: 'home' },
          { title: 'Tasks', route: '/cmas/field-personnel/tasks', icon: 'clipboard-check' },
          { title: 'Location', route: '/cmas/field-personnel/location', icon: 'map' }
        ]
      },
      {
        title: 'Reports',
        items: [
          { title: 'Daily Reports', route: '/cmas/field-personnel/reports', icon: 'document-text' },
          { title: 'Incidents', route: '/cmas/field-personnel/incidents', icon: 'exclamation' }
        ]
      }
    ],
    supervisor: [
      {
        title: 'Overview',
        items: [
          { title: 'Dashboard', route: '/cmas/supervisor', icon: 'home' },
          { title: 'Team Overview', route: '/cmas/supervisor/team', icon: 'users' }
        ]
      },
      {
        title: 'Monitoring',
        items: [
          { title: 'Performance', route: '/cmas/supervisor/performance', icon: 'chart-bar' },
          { title: 'Reports', route: '/cmas/supervisor/reports', icon: 'document-report' }
        ]
      }
    ]
  };

  getRoleBasedSections(): NavSection[] {
    return this.roleBasedNavigation[this.currentRole] || [];
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
      exclamation: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    };
    return iconPaths[icon] || '';
  }

  logout() {
    this.authService.logout();
  }
} 