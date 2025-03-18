import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BondService, BondLookupRequest } from '../../services/bond.service';
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
      risk_no: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
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

      const request: BondLookupRequest = {
        risk_no: this.lookupForm.get('risk_no')?.value,
        first_name: this.lookupForm.get('first_name')?.value,
        last_name: this.lookupForm.get('last_name')?.value
      };

      this.bondService.lookupBond(request).subscribe({
        next: (result) => {
          this.loading = false;
          if (result) {
            this.router.navigate(['/fidelity-bond/bond-details', result.id]);
          } else {
            this.error = 'No bond found with the provided details';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'An error occurred while looking up the bond';
          console.error('Bond lookup error:', error);
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
