import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FidelityBondService } from '../../../services/fidelity-bond.service';
import { FidelityBond, FidelityBondCreate } from '../../../models/fidelity-bond.interface';

@Component({
  selector: 'app-bond-management',
  templateUrl: './bond-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [FidelityBondService]
})
export class BondManagementComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDepartment: string = 'all';
  showAddBondModal: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  dateRange = {
    start: '',
    end: ''
  };

  bondForm!: FormGroup;

  statuses: string[] = ['Active', 'Expired', 'Pending'];
  departments: string[] = [];
  bonds: FidelityBond[] = [];
  
  constructor(
    private bondService: FidelityBondService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBonds();
    this.loadDepartments();
  }

  private initializeForm(bond?: FidelityBond) {
    // Format dates if they exist
    const effectivityDate = bond?.effectivity_date ? bond.effectivity_date.split('T')[0] : '';
    const cancellationDate = bond?.date_of_cancellation ? bond.date_of_cancellation.split('T')[0] : '';

    this.bondForm = this.fb.group({
      unit_office: [bond?.unit_office || '', Validators.required],
      rank: [bond?.rank || '', Validators.required],
      name: [bond?.name || '', Validators.required],
      designation: [bond?.designation || '', Validators.required],
      mca: [bond?.mca || '', [Validators.required, Validators.min(0)]],
      amount_of_bond: [bond?.amount_of_bond || '', [Validators.required, Validators.min(0)]],
      bond_premium: [bond?.bond_premium || '', [Validators.required, Validators.min(0)]],
      risk_no: [bond?.risk_no || '', Validators.required],
      effectivity_date: [effectivityDate, Validators.required],
      date_of_cancellation: [cancellationDate, Validators.required],
      status: [bond?.status || 'Active', Validators.required],
      remark: [bond?.remark || ''],
      contact_no: [bond?.contact_no || '', [Validators.pattern('^[0-9+-]{10,}$')]]
    });
  }

  loadBonds() {
    this.loading = true;
    this.error = null;
    this.bondService.getBonds().subscribe({
      next: (data) => {
        this.bonds = data;
        this.loadDepartments();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bonds:', err);
        this.error = 'Failed to load bonds. Please check your connection and try again.';
        this.loading = false;
      }
    });
  }

  loadDepartments() {
    // Get unique departments from bonds
    this.departments = [...new Set(this.bonds.map(bond => bond.unit_office))];
  }

  get filteredBonds() {
    return this.bonds.filter(bond => {
      const matchesSearch = 
        bond.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.unit_office.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.risk_no.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || bond.status === this.selectedStatus;
      const matchesDepartment = this.selectedDepartment === 'all' || bond.unit_office === this.selectedDepartment;
      const matchesDateRange = this.isWithinDateRange(bond.date_of_cancellation);
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesDateRange;
    });
  }

  private isWithinDateRange(date: string): boolean {
    if (!this.dateRange.start && !this.dateRange.end) return true;
    
    const bondDate = new Date(date);
    const start = this.dateRange.start ? new Date(this.dateRange.start) : null;
    const end = this.dateRange.end ? new Date(this.dateRange.end) : null;

    if (start && end) {
      return bondDate >= start && bondDate <= end;
    } else if (start) {
      return bondDate >= start;
    } else if (end) {
      return bondDate <= end;
    }
    
    return true;
  }

  getStatusCount(status: string): number {
    return this.bonds.filter(bond => bond.status === status).length;
  }

  getExpiringCount(): number {
    return this.bonds.filter(bond => 
      bond.status === 'Active' && 
      (bond.days_remaining ?? 0) <= 30 && 
      (bond.days_remaining ?? 0) > 0
    ).length;
  }

  getTotalBondValue(): number {
    return this.bonds
      .filter(bond => bond.status === 'Active')
      .reduce((sum, bond) => sum + bond.amount_of_bond, 0);
  }

  viewBondDetails(bond: FidelityBond) {
    // Implement view details modal
    console.log('View bond details:', bond);
  }

  editBond(bond: FidelityBond) {
    this.initializeForm(bond);
    this.showAddBondModal = true;
  }

  confirmDelete(bond: FidelityBond) {
    if (confirm(`Are you sure you want to delete the bond for ${bond.name}?`)) {
      this.deleteBond(bond.id!);
    }
  }

  deleteBond(id: string) {
    this.loading = true;
    this.bondService.deleteBond(id).subscribe({
      next: () => {
        this.bonds = this.bonds.filter(b => b.id !== id);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to delete bond';
        this.loading = false;
        console.error(err);
      }
    });
  }

  exportToExcel() {
    // Implement Excel export functionality
    console.log('Export to Excel');
  }

  onSubmit() {
    if (this.bondForm.valid) {
      try {
        const formValue = this.bondForm.value;
        console.log('Form values:', formValue); // Debug log

        // Format dates to ISO string
        const effectivityDate = new Date(formValue.effectivity_date);
        const cancellationDate = new Date(formValue.date_of_cancellation);

        const bondData: FidelityBondCreate = {
          unit_office: formValue.unit_office.trim(),
          rank: formValue.rank.trim(),
          name: formValue.name.trim(),
          designation: formValue.designation.trim(),
          mca: Number(formValue.mca),
          amount_of_bond: Number(formValue.amount_of_bond),
          bond_premium: Number(formValue.bond_premium),
          risk_no: formValue.risk_no.trim(),
          effectivity_date: effectivityDate.toISOString(),
          date_of_cancellation: cancellationDate.toISOString(),
          status: formValue.status,
          remark: formValue.remark?.trim() || '',
          contact_no: formValue.contact_no?.trim() || ''
        };

        console.log('Processed bond data:', bondData); // Debug log

        this.loading = true;
        this.error = null;
        
        this.bondService.createBond(bondData).subscribe({
          next: (bond) => {
            console.log('Bond created successfully:', bond); // Debug log
            this.bonds.unshift(bond);
            this.showAddBondModal = false;
            this.bondForm.reset();
            this.loading = false;
            this.loadDepartments();
          },
          error: (err) => {
            console.error('Detailed error creating bond:', err);
            this.error = `Failed to create bond: ${err.message || 'Unknown error'}`;
            this.loading = false;
          }
        });
      } catch (err) {
        console.error('Error processing form data:', err);
        this.error = 'Error processing form data. Please check your inputs.';
        this.loading = false;
      }
    } else {
      console.log('Form validation errors:', this.bondForm.errors);
      const invalidFields = Object.keys(this.bondForm.controls)
        .filter(key => this.bondForm.get(key)?.invalid)
        .join(', ');
      this.error = `Please fill in all required fields correctly. Invalid fields: ${invalidFields}`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDaysUntilExpiry(expiryDate: Date): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  closeModal() {
    this.showAddBondModal = false;
    this.bondForm.reset();
    this.error = null;
  }
}
