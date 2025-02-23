import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';

interface FbusBond {
  id?: string;
  rank: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  designation: string;
  despic: string;
  unit_office: string;
  mca: string;
  amount_of_bond: string;
  bond_premium: string;
  risk_no: string;
  riskpic: string;
  effective_date: string;
  date_of_cancellation: string;
  status: string;
  days_remaning: string;
  contact_no: string;
  units: string;
  profile: string;
  remark: string;
  dates?: string;
}

@Component({
  selector: 'app-bond-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bond-management.component.html',
  styles: [`
    @keyframes blink-warning {
      0% { 
        background-color: rgb(254, 243, 199);  /* yellow-100 */
        color: rgb(146, 64, 14);  /* yellow-800 */
      }
      50% { 
        background-color: rgb(255, 237, 213);  /* orange-100 */
        color: rgb(194, 65, 12);  /* orange-800 */
      }
      100% { 
        background-color: rgb(254, 243, 199);  /* yellow-100 */
        color: rgb(146, 64, 14);  /* yellow-800 */
      }
    }
    .blink-warning {
      animation: blink-warning 1.5s ease-in-out infinite;
    }
  `]
})
export class BondManagementComponent implements OnInit {
  bonds: FbusBond[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDepartment: string = 'all';
  showAddBondModal: boolean = false;
  newBond: FbusBond = this.getEmptyBond();
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  departments: string[] = ['Finance', 'Treasury', 'Accounting', 'HR', 'Operations', 'IT'];
  statuses: string[] = ['VALID', 'EXPIRE SOON', 'EXPIRED'];

  parseInt = Number.parseInt;

  availableUnits: { units: string }[] = [];

  ranks: string[] = [
    'Pat',
    'PCpl',
    'PSSg',
    'PMSg',
    'PSMS',
    'PCMS',
    'PEMS',
    'PLT',
    'PCPT',
    'PMAJ',
    'PLTCOL',
    'PCOL',
    'PBGEN',
    'PMGEN',
    'PLTGEN',
    'PGEN',
    'NUP'
  ];

  constructor(private supabase: SupabaseService) {}

  private getEmptyBond(): FbusBond {
    return {
      rank: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      designation: '',
      despic: '',
      unit_office: '',
      mca: '',
      amount_of_bond: '',
      bond_premium: '',
      risk_no: '',
      riskpic: '',
      effective_date: '',
      date_of_cancellation: '',
      status: 'VALID',
      days_remaning: '',
      contact_no: '',
      units: '',
      profile: '',
      remark: ''
    };
  }

  async ngOnInit() {
    await this.loadUnits();
    await this.loadBonds();
  }

  async loadUnits() {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('fbus_units')
        .select('units')
        .is('deleted_at', null);

      if (error) throw error;
      this.availableUnits = data || [];
    } catch (error) {
      console.error('Error loading units:', error);
      this.error = 'Failed to load units. Please try again.';
    }
  }

  async loadBonds() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const { data, error } = await this.supabase.getClient()
        .from('fbus_list')
        .select('*')
        .order('dates', { ascending: false });

      if (error) throw error;

      this.bonds = data || [];
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading bonds:', error);
      this.error = 'Failed to load bonds. Please try again.';
      this.isLoading = false;
    }
  }

  get filteredBonds(): FbusBond[] {
    return this.bonds.filter(bond => {
      // Calculate the actual status for each bond
      const currentStatus = this.calculateBondStatus(bond);
      
      // Apply filters
      const matchesSearch = !this.searchTerm || 
        bond.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.middle_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.unit_office.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || currentStatus === this.selectedStatus;
      const matchesDepartment = this.selectedDepartment === 'all' || bond.unit_office === this.selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  async onSubmitBond(form: NgForm) {
    if (form.valid) {
      try {
        // Calculate the initial status before submitting
        const calculatedStatus = this.calculateBondStatus(this.newBond);
        const bondData = {
          ...this.newBond,
          status: calculatedStatus
        };
        
        const { data, error } = await this.supabase.getClient()
          .from('fbus_list')
          .insert([bondData])
          .select();

        if (error) throw error;

        if (data) {
          const newBonds = data as FbusBond[];
          this.bonds = [...newBonds, ...this.bonds];
          this.showAddBondModal = false;
          this.newBond = this.getEmptyBond();
          form.resetForm();
        }
      } catch (error) {
        console.error('Error creating bond:', error);
        this.error = 'Failed to create bond. Please try again.';
      }
    }
  }

  async onDeleteBond(bond: FbusBond) {
    if (confirm(`Are you sure you want to delete the bond for ${bond.first_name} ${bond.last_name}?`)) {
      try {
        const { error } = await this.supabase.getClient()
          .from('fbus_list')
          .delete()
          .eq('id', bond.id);

        if (error) throw error;

        this.bonds = this.bonds.filter(b => b.id !== bond.id);
      } catch (error) {
        console.error('Error deleting bond:', error);
        this.error = 'Failed to delete bond. Please try again.';
      }
    }
  }

  async onEditBond(bond: FbusBond) {
    try {
      this.newBond = { ...bond };
      this.showAddBondModal = true;
    } catch (error) {
      console.error('Error editing bond:', error);
      this.error = 'Failed to edit bond. Please try again.';
    }
  }

  formatCurrency(amount: string): string {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(num);
  }

  calculateBondStatus(bond: FbusBond): string {
    const today = new Date();
    const expiry = new Date(bond.date_of_cancellation);
    const effective = new Date(bond.effective_date);
    
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (today < effective) {
      return 'VALID';
    } else if (daysUntilExpiry <= 0) {
      return 'EXPIRED';
    } else if (daysUntilExpiry <= 14) { // 2 weeks
      return 'EXPIRE SOON';
    } else {
      return 'VALID';
    }
  }

  getStatusColor(bond: FbusBond): string {
    const status = this.calculateBondStatus(bond);
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800';
      case 'EXPIRE SOON':
        return 'blink-warning';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onDateChange() {
    if (this.newBond.effective_date && this.newBond.date_of_cancellation) {
      const today = new Date();
      const expiry = new Date(this.newBond.date_of_cancellation);
      const effective = new Date(this.newBond.effective_date);
      
      // Calculate days until expiry
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Set status based on date calculations
      if (today < effective) {
        this.newBond.status = 'VALID';
      } else if (daysUntilExpiry <= 0) {
        this.newBond.status = 'EXPIRED';
      } else if (daysUntilExpiry <= 14) { // 2 weeks
        this.newBond.status = 'EXPIRE SOON';
      } else {
        this.newBond.status = 'VALID';
      }

      // Update days remaining
      this.newBond.days_remaning = daysUntilExpiry.toString();
    }
  }
}
