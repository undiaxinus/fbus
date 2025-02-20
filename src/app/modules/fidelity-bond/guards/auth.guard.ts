import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
      const user = JSON.parse(currentUser);
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.includes(user.role)) {
        return true;
      }
    }

    // Not logged in or role doesn't match, redirect to login page
    this.router.navigate(['/fidelity-bond/login']);
    return false;
  }
} 