import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/cmas/login']);
          return false;
        }

        const requiredRole = route.data['role'] as string;
        if (!requiredRole) {
          return true;
        }

        if (user.role !== requiredRole) {
          // Redirect to the default route for the user's role
          const defaultRoute = this.getDefaultRouteForRole(user.role);
          this.router.navigate([defaultRoute]);
          return false;
        }

        return true;
      })
    );
  }

  private getDefaultRouteForRole(role: string): string {
    const roleRouteMap: { [key: string]: string } = {
      duty_pnco: '/cmas/duty-pnco',
      section_personnel: '/cmas/section-personnel',
      cmas_admin: '/cmas/admin-personnel',
      field_personnel: '/cmas/field-personnel',
      supervisor: '/cmas/supervisor'
    };

    return roleRouteMap[role] || '/cmas/login';
  }
} 