import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { firstValueFrom } from 'rxjs';
import { delay, retryWhen, take, tap } from 'rxjs/operators';

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
  is_archived: boolean;
  updated_at?: string;
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

  designations: any[] = [];

  viewMode: 'active' | 'archived' = 'active';
  activeBonds: FbusBond[] = [];
  archivedBonds: FbusBond[] = [];

  showArchivedModal: boolean = false;
  archivedSearchTerm: string = '';

  showArchiveConfirmModal = false;
  bondToArchive: FbusBond | null = null;

  showViewBondModal: boolean = false;
  selectedBond: FbusBond | null = null;

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
      remark: '',
      is_archived: false
    };
  }

  async ngOnInit() {
    await this.loadUnits();
    await this.loadBonds();
    await this.loadDesignations();
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

  private async ensureAuthenticated() {
    try {
      const session = await this.supabase.getClient().auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      this.error = 'Session expired. Please refresh the page to log in again.';
      return false;
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        if (!(await this.ensureAuthenticated())) {
          throw new Error('Authentication failed');
        }
        return await operation();
      } catch (error: any) {
        attempts++;
        if (attempts === maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
    throw new Error('Operation failed after maximum retries');
  }

  async loadBonds() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const { data, error } = await this.retryOperation(async () => {
        return await this.supabase.getClient()
          .from('fbus_list')
          .select('*')
          .order('updated_at', { ascending: false })
          .order('dates', { ascending: false });
      });

      if (error) throw error;

      if (data) {
        this.activeBonds = data.filter(bond => !bond.is_archived);
        this.archivedBonds = data.filter(bond => bond.is_archived);
      }
    } catch (error: any) {
      console.error('Error loading bonds:', error);
      this.error = 'Failed to load bonds. Please refresh the page and try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadDesignations() {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('fbus_designation')
        .select('*')
        .order('designation', { ascending: true });

      if (error) throw error;

      if (data) {
        this.designations = data;
      }
    } catch (error) {
      console.error('Error loading designations:', error);
    }
  }

  get filteredBonds(): FbusBond[] {
    const bonds = this.viewMode === 'active' ? this.activeBonds : this.archivedBonds;
    return bonds.filter(bond => {
      const matchesSearch = !this.searchTerm || 
        bond.first_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.middle_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.last_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.unit_office?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.risk_no?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'all' || this.calculateBondStatus(bond) === this.selectedStatus;
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

  async onArchiveBond(bond: FbusBond) {
    this.bondToArchive = bond;
    this.showArchiveConfirmModal = true;
  }

  async confirmArchiveBond() {
    if (!this.bondToArchive) return;
    
    try {
      const { data, error } = await this.supabase.getClient()
        .from('fbus_list')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', this.bondToArchive.id)
        .select();

      if (error) throw error;

      // Update local arrays
      const index = this.activeBonds.findIndex(b => b.id === this.bondToArchive!.id);
      if (index !== -1) {
        const [archivedBond] = this.activeBonds.splice(index, 1);
        archivedBond.is_archived = true;
        archivedBond.updated_at = new Date().toISOString();
        this.archivedBonds.unshift(archivedBond);
      }

      this.showArchiveConfirmModal = false;
      this.bondToArchive = null;
      
      // Clear any existing error
      this.error = null;
    } catch (error: any) {
      console.error('Error archiving bond:', error);
      const errorMessage = error?.message || error?.error_description || 'Failed to archive bond. Please try again.';
      this.error = errorMessage;
      
      // Reload bonds to ensure UI state is consistent with database
      await this.loadBonds();
    }
  }

  get filteredArchivedBonds(): FbusBond[] {
    return this.archivedBonds.filter(bond => {
      const searchTerm = this.archivedSearchTerm.toLowerCase();
      return !this.archivedSearchTerm || 
        bond.first_name?.toLowerCase().includes(searchTerm) ||
        bond.middle_name?.toLowerCase().includes(searchTerm) ||
        bond.last_name?.toLowerCase().includes(searchTerm) ||
        bond.unit_office?.toLowerCase().includes(searchTerm) ||
        bond.risk_no?.toLowerCase().includes(searchTerm);
    });
  }

  async onRestoreBond(bond: FbusBond) {
    if (!bond.id) {
      this.error = 'Invalid bond ID. Please refresh the page and try again.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const { data: updatedBond, error: updateError } = await this.retryOperation(async () => {
        return await this.supabase.getClient()
          .from('fbus_list')
          .update({ is_archived: false })
          .eq('id', bond.id)
          .select()
          .single();
      });

      if (updateError) throw updateError;
      if (!updatedBond) throw new Error('Failed to restore bond');

      // Update local state
      const index = this.archivedBonds.findIndex(b => b.id === bond.id);
      if (index !== -1) {
        const [restoredBond] = this.archivedBonds.splice(index, 1);
        restoredBond.is_archived = false;
        this.activeBonds.unshift(restoredBond);
      }

      // Clear any existing error
      this.error = null;
      
      // Close the modal if there are no more archived bonds
      if (this.archivedBonds.length === 0) {
        this.showArchivedModal = false;
      }
    } catch (error: any) {
      console.error('Error restoring bond:', error);
      const errorMessage = error?.message || error?.error_description || 'Failed to restore bond. Please try again.';
      this.error = errorMessage;
      
      // Reload bonds to ensure UI state is consistent with database
      await this.loadBonds();
    } finally {
      this.isLoading = false;
    }
  }

  onViewBond(bond: FbusBond) {
    this.selectedBond = bond;
    this.showViewBondModal = true;
  }
}
