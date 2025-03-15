import { Routes } from '@angular/router';
import { AdminUsersComponent } from './components/admin/users/admin-users.component';

const routes: Routes = [
  {
    path: 'admin',
    children: [
      { path: 'users', component: AdminUsersComponent },
    ]
  }
]; 