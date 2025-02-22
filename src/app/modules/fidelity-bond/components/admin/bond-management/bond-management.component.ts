import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FidelityBond } from '../../../models/fidelity-bond.model';
import { FidelityBondService } from '../../../services/fidelity-bond.service';
import { SupabaseService } from '../../../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bond-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bond-management.component.html'
})
export class BondManagementComponent implements OnInit {
  bonds: FidelityBond[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDepartment: string = 'all';
  showAddBondModal: boolean = false;
  newBond: Partial<FidelityBond> = {
    status: 'Active'
  };
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  departments: string[] = ['Finance', 'Treasury', 'Accounting', 'HR', 'Operations', 'IT'];
  statuses: string[] = ['Active', 'Expiring Soon', 'Expired', 'Renewed'];

  constructor(
    private bondService: FidelityBondService,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const session = await this.supabase.getClient().auth.getSession();
      if (!session.data.session) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadBonds();
    } catch (error) {
      console.error('Error checking authentication:', error);
      this.error = 'Error checking authentication status';
    }
  }

  loadBonds() {
    this.isLoading = true;
    this.error = null;
    
    this.bondService.getBonds().subscribe({
      next: (bonds) => {
        this.bonds = this.processBonds(bonds);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bonds:', error);
        this.error = 'Failed to load bonds. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private processBonds(bonds: FidelityBond[]): FidelityBond[] {
    return bonds.map(bond => ({
      ...bond,
      days_remaining: bond.date_of_cancellation ? 
        this.getDaysUntilExpiry(new Date(bond.date_of_cancellation)) : 
        undefined
    }));
  }

  get filteredBonds(): FidelityBond[] {
    return this.bonds.filter(bond => {
      const searchTermLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        (bond.name?.toLowerCase().includes(searchTermLower) ?? false) ||
        (bond.unit_office?.toLowerCase().includes(searchTermLower) ?? false) ||
        (bond.designation?.toLowerCase().includes(searchTermLower) ?? false) ||
        (bond.risk_no?.toLowerCase().includes(searchTermLower) ?? false);

      const matchesStatus = this.selectedStatus === 'all' || bond.status === this.selectedStatus;
      const matchesDepartment = this.selectedDepartment === 'all' || bond.unit_office === this.selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'renewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(amount: number | null): string {
    if (amount == null) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  getDaysUntilExpiry(date: Date): number {
    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onSubmitBond(form: NgForm) {
    if (form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Submitting bond data:', this.newBond);

      this.bondService.createBond(this.newBond as Omit<FidelityBond, 'id' | 'created_at' | 'updated_at'>).subscribe({
        next: (createdBond) => {
          console.log('Bond created successfully:', createdBond);
          this.bonds = [createdBond, ...this.bonds];
          this.showAddBondModal = false;
          this.newBond = { status: 'Active' };
          this.isSubmitting = false;
          form.resetForm();
        },
        error: (error) => {
          console.error('Error creating bond:', error);
          this.error = 'Failed to create bond. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  onEditBond(bond: FidelityBond) {
    // TODO: Implement edit functionality
    console.log('Editing bond:', bond);
  }

  onDeleteBond(bond: FidelityBond) {
    if (confirm(`Are you sure you want to delete the bond for ${bond.name}?`)) {
      this.bondService.deleteBond(bond.id!).subscribe({
        next: () => {
          this.bonds = this.bonds.filter(b => b.id !== bond.id);
        },
        error: (error) => {
          console.error('Error deleting bond:', error);
          this.error = 'Failed to delete bond. Please try again.';
        }
      });
    }
  }
}
