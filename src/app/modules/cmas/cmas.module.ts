import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../../components/landing-page/login/login.component';
import { DutyPncoComponent } from './pages/duty-pnco/duty-pnco.component';
import { SectionPersonnelComponent } from './pages/section-personnel/section-personnel.component';
import { AdminPersonnelComponent } from './pages/admin-personnel/admin-personnel.component';
import { FieldPersonnelComponent } from './pages/field-personnel/field-personnel.component';
import { SupervisorComponent } from './pages/supervisor/supervisor.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'duty-pnco', component: DutyPncoComponent },
  { path: 'section-personnel', component: SectionPersonnelComponent },
  { path: 'admin-personnel', component: AdminPersonnelComponent },
  { path: 'field-personnel', component: FieldPersonnelComponent },
  { path: 'supervisor', component: SupervisorComponent }
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