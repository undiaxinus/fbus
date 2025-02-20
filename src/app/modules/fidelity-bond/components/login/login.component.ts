import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  // Dummy user data
  private dummyUsers = [
    { username: 'admin@gmail.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    { username: 'user@gmail.com', password: 'user123', role: 'user', name: 'John Doe' }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      
      // Check credentials against dummy data
      const user = this.dummyUsers.find(u => 
        u.username === username && u.password === password
      );

      if (user) {
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          username: user.username,
          role: user.role,
          name: user.name
        }));

        // Navigate to the appropriate dashboard
        const route = user.role === 'admin' ? '/fidelity-bond/admin' : '/fidelity-bond/user';
        this.router.navigate([route]);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
} 