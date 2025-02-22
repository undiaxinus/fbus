import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #111827;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  systemType: 'fidelity-bond' | 'cmas' = 'cmas';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.systemType = this.router.url.includes('fidelity-bond') ? 'fidelity-bond' : 'cmas';
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      
      try {
        const user = await this.userService.validateUser(username, password);

        if (user && user.system_role === this.systemType) {
          this.authService.login(user);

          if (this.systemType === 'cmas') {
            switch (user.role) {
              case 'cmas_admin':
                this.router.navigate(['/cmas/admin-personnel']);
                break;
              case 'duty_pnco':
                this.router.navigate(['/cmas/duty-pnco']);
                break;
              case 'section_personnel':
                this.router.navigate(['/cmas/section-personnel']);
                break;
              case 'field_personnel':
                this.router.navigate(['/cmas/field-personnel']);
                break;
              case 'supervisor':
                this.router.navigate(['/cmas/supervisor']);
                break;
              default:
                this.router.navigate(['/cmas']);
            }
          } else {
            if (user.role === 'fbus_admin') {
              this.router.navigate(['/fidelity-bond/admin']);
            } else {
              this.router.navigate(['/fidelity-bond/user']);
            }
          }
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }

  goToLanding() {
    this.router.navigate(['/']);
  }

  getSystemInfo() {
    if (this.systemType === 'fidelity-bond') {
      return {
        logo: '/assets/finance.png',
        title: 'Fidelity Bond System'
      };
    } else {
      return {
        logo: '/assets/logo.png',
        title: 'CMAS Login'
      };
    }
  }
} 