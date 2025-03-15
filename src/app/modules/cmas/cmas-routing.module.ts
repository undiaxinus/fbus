import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { LoginComponent } from '../../components/landing-page/login/login.component';
import { DutyPncoComponent } from './components/duty-pnco/duty-pnco.component';
import { SectionPersonnelComponent } from './components/section-personnel/section-personnel.component';
import { AdminPersonnelComponent } from './components/admin-personnel/admin-personnel.component';
import { FieldPersonnelComponent } from './components/field-personnel/field-personnel.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { CmasLayoutComponent } from './layout/cmas-layout.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: CmasLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'duty-pnco',
        canActivate: [RoleGuard],
        data: { role: 'duty_pnco' },
        children: [
          { path: '', component: DutyPncoComponent },
          { path: 'roster', loadComponent: () => import('./components/duty-pnco/roster/roster.component').then(m => m.DutyRosterComponent) },
          { path: 'reports', loadComponent: () => import('./components/duty-pnco/reports/reports.component').then(m => m.ReportsComponent) }
        ]
      },
      {
        path: 'section-personnel',
        canActivate: [RoleGuard],
        data: { role: 'section_personnel' },
        children: [
          { path: '', component: SectionPersonnelComponent },
          { path: 'tasks', loadComponent: () => import('./components/section-personnel/tasks/tasks.component').then(m => m.TasksComponent) },
          { path: 'documents', loadComponent: () => import('./components/section-personnel/documents/documents.component').then(m => m.DocumentsComponent) },
          { path: 'team', loadComponent: () => import('./components/section-personnel/team/team.component').then(m => m.TeamComponent) },
          { 
            path: 'schedule', 
            loadComponent: () => import('./components/section-personnel/schedule').then(m => m.ScheduleComponent),
            data: { preload: true }
          }
        ]
      },
      {
        path: 'admin-personnel',
        canActivate: [RoleGuard],
        data: { role: 'cmas_admin' },
        children: [
          { path: '', component: AdminPersonnelComponent },
          { path: 'users', loadComponent: () => import('./components/admin-personnel/users/users.component').then(m => m.UsersComponent) },
          { path: 'roles', loadComponent: () => import('./components/admin-personnel/roles/roles.component').then(m => m.RolesComponent) },
          { path: 'permissions', loadComponent: () => import('./components/admin-personnel/permissions/permissions.component').then(m => m.PermissionsComponent) },
          { path: 'settings', loadComponent: () => import('./components/admin-personnel/settings/settings.component').then(m => m.SettingsComponent) },
          { path: 'security', loadComponent: () => import('./components/admin-personnel/security/security.component').then(m => m.SecurityComponent) },
          { path: 'logs', loadComponent: () => import('./components/admin-personnel/logs/logs.component').then(m => m.LogsComponent) }
        ]
      },
      {
        path: 'field-personnel',
        canActivate: [RoleGuard],
        data: { role: 'field_personnel' },
        children: [
          { path: '', component: FieldPersonnelComponent },
          { path: 'tasks', loadComponent: () => import('./components/field-personnel/tasks/tasks.component').then(m => m.TasksComponent) },
          { path: 'reports', loadComponent: () => import('./components/field-personnel/reports/reports.component').then(m => m.ReportsComponent) },
          { path: 'location', loadComponent: () => import('./components/field-personnel/location/location.component').then(m => m.LocationComponent) },
          { 
            path: 'incidents', 
            loadComponent: () => import('./components/field-personnel/incidents').then(m => m.IncidentsComponent),
            data: { preload: true }
          }
        ]
      },
      {
        path: 'supervisor',
        canActivate: [RoleGuard],
        data: { role: 'supervisor' },
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmasRoutingModule { } 