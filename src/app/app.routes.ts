import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    component: LandingPageComponent
  },
  {
    path: 'fidelity-bond/login',
    loadComponent: () => import('./modules/fidelity-bond/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cmas/login',
    loadComponent: () => import('./modules/cmas/pages/login/login.component').then(m => m.LoginComponent)
  }
];
