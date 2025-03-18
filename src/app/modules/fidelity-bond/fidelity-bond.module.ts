import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { LoginComponent } from '../../components/landing-page/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { UserLayoutComponent } from './components/user/layout/user-layout.component';
import { UserDashboardComponent } from './components/user/dashboard/user-dashboard.component';
import { UserBondsComponent } from './components/user/bonds/user-bonds.component';
import { UserRequestsComponent } from './components/user/requests/user-requests.component';
import { UserNotificationsComponent } from './components/user/notifications/user-notifications.component';
import { UserProfileComponent } from './components/user/profile/user-profile.component';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { SharedModule } from '../../shared/shared.module';
import { BondManagementComponent } from './components/admin/bond-management/bond-management.component';
import { FidelityBondRoutingModule } from './fidelity-bond-routing.module';
import { BondLookupComponent } from './components/bond-lookup/bond-lookup.component';
import { BondDetailsComponent } from './components/bond-details/bond-details.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    BondManagementComponent,
    AdminDashboardComponent,
    LoginComponent,
    AdminLayoutComponent,
    UserLayoutComponent,
    UserDashboardComponent,
    SidebarComponent,
    UserBondsComponent,
    UserRequestsComponent,
    UserNotificationsComponent,
    UserProfileComponent,
    BondLookupComponent,
    BondDetailsComponent,
    FidelityBondRoutingModule
  ]
})
export class FidelityBondModule { }