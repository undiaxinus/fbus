import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../../components/landing-page/login/login.component';
import { DutyPncoComponent } from './components/duty-pnco/duty-pnco.component';
import { SectionPersonnelComponent } from './components/section-personnel/section-personnel.component';
import { AdminPersonnelComponent } from './components/admin-personnel/admin-personnel.component';
import { FieldPersonnelComponent } from './components/field-personnel/field-personnel.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { CmasLayoutComponent } from './layout/cmas-layout.component';
import { DutyRosterComponent } from './components/duty-pnco/roster/roster.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: CmasLayoutComponent,
    children: [
      {
        path: 'duty-pnco',
        children: [
          { path: '', component: DutyPncoComponent },
          { path: 'roster', component: DutyRosterComponent },
          { path: 'reports', loadComponent: () => import('./components/duty-pnco/reports/reports.component').then(m => m.ReportsComponent) },
          { path: 'notifications', loadComponent: () => import('./components/duty-pnco/notifications/notifications.component').then(m => m.NotificationsComponent) }
        ]
      },
      {
        path: 'section-personnel',
        children: [
          { path: '', component: SectionPersonnelComponent },
          { path: 'tasks', loadComponent: () => import('./components/section-personnel/tasks/tasks.component').then(m => m.TasksComponent) },
          { path: 'documents', loadComponent: () => import('./components/section-personnel/documents/documents.component').then(m => m.DocumentsComponent) },
          { path: 'team', loadComponent: () => import('./components/section-personnel/team/team.component').then(m => m.TeamComponent) }
        ]
      },
      {
        path: 'admin-personnel',
        children: [
          { path: '', component: AdminPersonnelComponent },
          { path: 'users', loadComponent: () => import('./components/admin-personnel/users/users.component').then(m => m.UsersComponent) },
          { path: 'settings', loadComponent: () => import('./components/admin-personnel/settings/settings.component').then(m => m.SettingsComponent) },
          { path: 'logs', loadComponent: () => import('./components/admin-personnel/logs/logs.component').then(m => m.LogsComponent) }
        ]
      },
      {
        path: 'field-personnel',
        children: [
          { path: '', component: FieldPersonnelComponent },
          { path: 'tasks', loadComponent: () => import('./components/field-personnel/tasks/tasks.component').then(m => m.TasksComponent) },
          { path: 'reports', loadComponent: () => import('./components/field-personnel/reports/reports.component').then(m => m.ReportsComponent) },
          { path: 'location', loadComponent: () => import('./components/field-personnel/location/location.component').then(m => m.LocationComponent) }
        ]
      },
      {
        path: 'supervisor',
        children: [
          { path: '', component: SupervisorComponent },
          { path: 'team', loadComponent: () => import('./components/supervisor/team/team.component').then(m => m.TeamComponent) },
          { path: 'performance', loadComponent: () => import('./components/supervisor/performance/performance.component').then(m => m.PerformanceComponent) },
          { path: 'reports', loadComponent: () => import('./components/supervisor/reports/reports.component').then(m => m.ReportsComponent) }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CmasModule { }