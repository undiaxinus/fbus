import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminUsersComponent } from './components/admin/users/admin-users.component';
import { BondLookupComponent } from './components/bond-lookup/bond-lookup.component';
import { BondDetailsComponent } from './components/bond-details/bond-details.component';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { LoginComponent } from '../../components/landing-page/login/login.component';
import { UserLayoutComponent } from './components/user/layout/user-layout.component';
import { UserDashboardComponent } from './components/user/dashboard/user-dashboard.component';
import { UserBondsComponent } from './components/user/bonds/user-bonds.component';
import { UserRequestsComponent } from './components/user/requests/user-requests.component';
import { UserNotificationsComponent } from './components/user/notifications/user-notifications.component';
import { UserProfileComponent } from './components/user/profile/user-profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['fbus_admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { 
        path: 'bonds', 
        loadComponent: () => import('./components/admin/bond-management/bond-management.component').then(m => m.BondManagementComponent)
      },
      { 
        path: 'units', 
        loadComponent: () => import('./components/admin/units/admin-units.component').then(m => m.AdminUnitsComponent)
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./components/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent)
      }
    ]
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['fbus_user'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'bonds', component: UserBondsComponent },
      { path: 'requests', component: UserRequestsComponent },
      { path: 'notifications', component: UserNotificationsComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  },
  {
    path: 'bond-lookup',
    component: BondLookupComponent
  },
  {
    path: 'bond-details',
    component: BondDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FidelityBondRoutingModule { } 