import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Back Button -->
        <div class="flex justify-start">
          <button (click)="goToLanding()" 
            class="flex items-center text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Landing Page
          </button>
        </div>

        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-400">
            {{ systemType === 'cmas' ? 'CMAS Management System' : 'Fidelity Bond System' }}
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" formControlName="username" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" formControlName="password" required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password">
            </div>
          </div>

          <div class="text-red-500 text-sm" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div>
            <button type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd" />
                </svg>
              </span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
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

  // Updated dummy user data with required id field
  private dummyUsers = [
    { 
      id: '1',
      username: 'admin@gmail.com', 
      password: 'admin123', 
      role: 'fbus_admin', 
      name: 'Admin User',
      user_metadata: { system_role: 'fidelity-bond' }
    },
    { 
      id: '2',
      username: 'user@gmail.com', 
      password: 'user123', 
      role: 'fbus_user', 
      name: 'John Doe',
      user_metadata: { system_role: 'fidelity-bond' }
    },
    // CMAS Users
    { 
      id: '3',
      username: 'duty_pnco@gmail.com', 
      password: 'DutyPNCO@2024', 
      role: 'duty_pnco', 
      name: 'Duty PNCO',
      user_metadata: { system_role: 'cmas' }
    },
    { 
      id: '4',
      username: 'section_personnel@gmail.com', 
      password: 'SectionStaff@2024', 
      role: 'section_personnel', 
      name: 'Section Staff',
      user_metadata: { system_role: 'cmas' }
    },
    { 
      id: '5',
      username: 'admin_personnel@gmail.com', 
      password: 'AdminStaff@2024', 
      role: 'cmas_admin', 
      name: 'Admin Staff',
      user_metadata: { system_role: 'cmas' }
    },
    { 
      id: '6',
      username: 'field_personnel@gmail.com', 
      password: 'FieldStaff@2024', 
      role: 'field_personnel', 
      name: 'Field Staff',
      user_metadata: { system_role: 'cmas' }
    },
    { 
      id: '7',
      username: 'supervisor_personel@gmail.com', 
      password: 'SupervisorStaff@2024', 
      role: 'supervisor', 
      name: 'Supervisor',
      user_metadata: { system_role: 'cmas' }
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if we're on the fidelity-bond login page
    this.systemType = this.router.url.includes('fidelity-bond') ? 'fidelity-bond' : 'cmas';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      // Check credentials against dummy data
      const dummyUser = this.dummyUsers.find(u => 
        u.username === username && 
        u.password === password && 
        u.user_metadata.system_role === this.systemType
      );

      if (dummyUser) {
        // Create a proper User object for auth service
        const user: User = {
          id: dummyUser.id,
          username: dummyUser.username,
          role: dummyUser.role,
          name: dummyUser.name,
          user_metadata: dummyUser.user_metadata
        };

        // Login through auth service
        this.authService.login(user);

        // Navigate based on system type and role
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
          // Fidelity Bond System navigation
          if (user.role === 'fbus_admin') {
            this.router.navigate(['/fidelity-bond/admin']);
          } else {
            this.router.navigate(['/fidelity-bond/user']);
          }
        }
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }

  goToLanding() {
    this.router.navigate(['/']);
  }
} 