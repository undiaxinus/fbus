import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // Return false for server-side rendering
    }

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