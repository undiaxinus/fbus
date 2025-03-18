import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BondService } from '../../services/bond.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bond-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bond-lookup.component.html',
  styleUrl: './bond-lookup.component.css'
})
export class BondLookupComponent implements OnInit {
  lookupForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bondService: BondService,
    private router: Router
  ) {
    this.lookupForm = this.fb.group({
      contact_no: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Clear any previous error state
    this.error = null;
  }

  onSubmit(): void {
    if (this.lookupForm.valid) {
      this.loading = true;
      this.error = null;

      this.bondService.lookupBond(this.lookupForm.value).subscribe({
        next: (bondDetails) => {
          this.loading = false;
          if (bondDetails) {
            // Navigate to bond details view with the data
            this.router.navigate(['/fidelity-bond/bond-details'], { 
              state: { bondDetails },
              replaceUrl: true // This prevents going back to the form with browser back button
            });
          } else {
            this.error = 'No bond found with the provided details. Please verify your information and try again.';
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Bond lookup error:', err);
          this.error = 'An error occurred while looking up the bond. Please try again later.';
        }
      });
    } else {
      // Show validation errors
      Object.keys(this.lookupForm.controls).forEach(key => {
        const control = this.lookupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  // Helper method to check if a field has errors
  hasFieldError(fieldName: string): boolean {
    const field = this.lookupForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.lookupForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${fieldName.replace('_', ' ')} is required`;
    }
    if (field.hasError('pattern')) {
      return 'Please enter a valid 11-digit contact number';
    }
    if (field.hasError('minlength')) {
      return `${fieldName.replace('_', ' ')} must be at least 2 characters`;
    }
    return '';
  }
}
