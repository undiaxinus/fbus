import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  systemType: 'fidelity-bond' | 'cmas' = 'fidelity-bond';

  // Dummy user data
  private dummyUsers = [
    { username: 'admin@gmail.com', password: 'admin123', role: 'fbus_admin', name: 'Admin User', system_role: 'fbus' },
    { username: 'user@gmail.com', password: 'user123', role: 'fbus_user', name: 'John Doe', system_role: 'fbus' },
    // CMAS Users
    { username: 'duty_pnco@gmail.com', password: 'DutyPNCO@2024', role: 'duty_pnco', name: 'Duty PNCO', system_role: 'cmas' },
    { username: 'section_personnel@gmail.com', password: 'SectionStaff@2024', role: 'section_personnel', name: 'Section Staff', system_role: 'cmas' },
    { username: 'admin_personnel@gmail.com', password: 'AdminStaff@2024', role: 'cmas_admin', name: 'Admin Staff', system_role: 'cmas' },
    { username: 'field_personnel@gmail.com', password: 'FieldStaff@2024', role: 'field_personnel', name: 'Field Staff', system_role: 'cmas' },
    { username: 'supervisor_personel@gmail.com', password: 'SupervisorStaff@2024', role: 'supervisor', name: 'Supervisor', system_role: 'cmas' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Determine system type from URL
    this.systemType = this.router.url.includes('fidelity-bond') ? 'fidelity-bond' : 'cmas';
  }

  getSystemInfo() {
    return {
      logo: this.systemType === 'fidelity-bond' ? 'assets/finance.png' : 'assets/logo.png',
      title: this.systemType === 'fidelity-bond' ? 'Fidelity Bond' : 'Communication Monitoring System',
    };
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
          name: user.name,
          system_role: user.system_role
        }));

        // Navigate based on system_role
        let route;
        if (user.system_role === 'fbus') {
          route = user.role === 'fbus_admin' ? '/fidelity-bond/admin' : '/fidelity-bond/user';
        } else if (user.system_role === 'cmas') {
          route = user.role === 'duty_pnco' ? '/cmas/duty-pnco' : user.role === 'section_personnel' ? '/cmas/section-personnel' : user.role === 'admin_personnel' ? '/cmas/admin-personnel' : user.role === 'field_personnel' ? '/cmas/field-personnel' : '/cmas/supervisor';
        }
        
        this.router.navigate([route]);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }
} 