import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { firstValueFrom } from 'rxjs';
import { delay, retryWhen, take, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook, Row, Cell } from 'exceljs';

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
  isEditMode: boolean = false;
  newBond: FbusBond = this.getEmptyBond();
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  departments: string[] = [];
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
    this.isLoading = true;
    this.error = null;

    try {
      // Load available units from the database
      const { data: units, error: unitsError } = await this.supabase.getClient()
        .from('fbus_units')
        .select('units')
        .is('deleted_at', null)
        .order('units', { ascending: true });

      if (unitsError) {
        console.error('Error loading units:', unitsError);
        throw new Error('Failed to load units');
      }

      this.availableUnits = units || [];

      // Load designations
      await this.loadDesignations();

      // Load bonds
      await this.loadBonds();

    } catch (error: any) {
      console.error('Error initializing component:', error);
      this.error = error?.message || 'Failed to load initial data. Please try again.';
    } finally {
      this.isLoading = false;
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
    try {
      const { data, error } = await this.retryOperation(async () => {
        return await this.supabase.getClient()
          .from('fbus_list')
          .select('*')
          .order('updated_at', { ascending: false })
          .order('dates', { ascending: false });
      });

      if (error) {
        console.error('Error loading bonds:', error);
        throw new Error('Failed to load bonds');
      }

      if (data) {
        this.activeBonds = data.filter(bond => !bond.is_archived);
        this.archivedBonds = data.filter(bond => bond.is_archived);
      }
    } catch (error: any) {
      throw error; // Propagate error to ngOnInit for centralized error handling
    }
  }

  async loadDesignations() {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('fbus_designation')
        .select('*')
        .is('deleted_at', null)
        .order('designation', { ascending: true });

      if (error) {
        console.error('Error loading designations:', error);
        throw new Error('Failed to load designations');
      }

      this.designations = data || [];
    } catch (error: any) {
      throw error; // Propagate error to ngOnInit for centralized error handling
    }
  }

  get filteredBonds(): FbusBond[] {
    const bonds = this.viewMode === 'active' ? this.activeBonds : this.archivedBonds;
    return bonds.filter(bond => {
      const searchTerm = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        bond.first_name?.toLowerCase().includes(searchTerm) ||
        bond.middle_name?.toLowerCase().includes(searchTerm) ||
        bond.last_name?.toLowerCase().includes(searchTerm) ||
        bond.unit_office?.toLowerCase().includes(searchTerm) ||
        bond.risk_no?.toLowerCase().includes(searchTerm);
      
      const bondStatus = this.calculateBondStatus(bond);
      const matchesStatus = this.selectedStatus === 'all' || bondStatus === this.selectedStatus;
      const matchesDepartment = this.selectedDepartment === 'all' || bond.unit_office === this.selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  async onSubmitBond(form: NgForm) {
    if (!form.valid) return;
    
    this.isSubmitting = true;
    this.error = '';

    try {
      let response;
      const bondData = { ...this.newBond };

      if (this.isEditMode) {
        // Update existing bond
        response = await this.supabase.getClient()
          .from('fbus_list')
          .update(bondData)
          .eq('id', this.newBond.id)
          .select();
      } else {
        // Create new bond
        response = await this.supabase.getClient()
          .from('fbus_list')
          .insert([bondData])
          .select();
      }

      const { data, error } = response;
      if (error) throw error;

      if (data) {
        // Log the activity in fbus_activities
        const { error: activityError } = await this.supabase.getClient()
          .from('fbus_activities')
          .insert([{
            action: this.isEditMode 
              ? `Updated bond for ${bondData.first_name} ${bondData.last_name}`
              : `Added new bond for ${bondData.first_name} ${bondData.last_name}`,
            user_name: await this.getCurrentUserName(),
            created_at: new Date().toISOString()
          }]);

        if (activityError) throw activityError;

        // Update local state
        if (this.isEditMode) {
          const index = this.activeBonds.findIndex(b => b.id === this.newBond.id);
          if (index !== -1) {
            this.activeBonds[index] = data[0];
          }
        } else {
          this.activeBonds = [data[0], ...this.activeBonds];
        }

        // Reset form and state
        this.showAddBondModal = false;
        this.isEditMode = false;
        this.newBond = this.getEmptyBond();
        form.resetForm();
        
        // Reload bonds to ensure consistency
        await this.loadBonds();
      }
    } catch (error: any) {
      console.error('Error saving bond:', error);
      this.error = error?.message || 'Failed to save bond. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private async getCurrentUserName(): Promise<string> {
    try {
      const { data: sessionData, error: sessionError } = await this.supabase.getClient()
        .from('users')
        .select('name')
        .limit(1)
        .single();

      if (sessionError) throw sessionError;

      if (sessionData && sessionData.name) {
        return sessionData.name;
      }

      return 'Unknown User';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Unknown User';
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
      this.isEditMode = true;
      this.newBond = { ...bond };
      this.showAddBondModal = true;
      this.showViewBondModal = false;
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedDepartment = 'all';
  }

  onViewBond(bond: FbusBond) {
    this.selectedBond = bond;
    this.showViewBondModal = true;
  }

  calculateDaysRemaining(bond: FbusBond): string {
    if (!bond.effective_date || !bond.date_of_cancellation) {
      return 'N/A';
    }

    const today = new Date();
    const expiry = new Date(bond.date_of_cancellation);
    
    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry.toString();
  }

  onCancelEdit() {
    this.showAddBondModal = false;
    this.isEditMode = false;
    this.newBond = this.getEmptyBond();
  }

  async exportReport() {
    try {
      const currentDate = new Date();
      const period = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + currentDate.getFullYear();

      // Create workbook and worksheet
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Bond Report');

      // Add images
      const logoId1 = workbook.addImage({
        base64: await this.getBase64Image('/assets/logo.png'),
        extension: 'png',
      });

      const logoId2 = workbook.addImage({
        base64: await this.getBase64Image('/assets/finance.png'),
        extension: 'png',
      });

      // Add headers starting from row 1
      const headerRows = [
        'Republic of the Philippines',
        'National Police Commission',
        'PHILIPPINE NATIONAL POLICE',
        'Regional Finance Unit-5',
        'Camp BGen Simeon A Ola, Legazcy City',
        '',  // Single empty row for spacing
        'List of NSU PNP Accountable Officers/Employees',
        'Other Accountable Officers/Finance PNCOs',
        `Period Covered: ${period}`,
        ''
      ];

      // Add and format header rows
      headerRows.forEach((text, index) => {
        if (text) {
          const row = worksheet.addRow([text]);
          worksheet.mergeCells(`A${row.number}:K${row.number}`);
          row.font = { bold: true, size: 12 };
          row.alignment = { horizontal: 'center', vertical: 'middle' };
          row.height = 18;
        } else {
          const emptyRow = worksheet.addRow([]);
          emptyRow.height = 10;
        }
      });

      // Add images overlapping with first few rows
      worksheet.addImage(logoId1, {
        tl: { col: 2, row: 3 },  // Start from top
        ext: { width: 80, height: 80 }
      });

      worksheet.addImage(logoId2, {
        tl: { col: 9, row: 3 },  // Start from top
        ext: { width: 80, height: 80 }
      });

      // Add table headers immediately after
      const mainHeaders = [
        'NR', 'RANK', 'NAME', 'DESIGNATION', 'UNIT', 'MCA',
        'FIDELITY BOND'
      ];

      const mainHeaderRow = worksheet.addRow(mainHeaders);
      mainHeaderRow.font = { bold: true };
      mainHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(`G${mainHeaderRow.number}:K${mainHeaderRow.number}`);

      // Add sub-headers
      const subHeaders = [
        '',             // NR
        '',             // RANK
        '',             // NAME
        '',             // DESIGNATION
        '',             // UNIT
        '',             // MCA
        'AMOUNT\nOF BOND',
        'BOND\nPREMIUM',
        'RISK NO.',
        'EFFECTIVITY\nDATE',
        'DATE OF\nCANCELLATION'
      ];

      // Add sub-header row
      const subHeaderRow = worksheet.addRow(subHeaders);
      subHeaderRow.font = { bold: true };
      subHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      subHeaderRow.height = 30; // Adjust height for wrapped text

      // Set column widths
      worksheet.columns = [
        { width: 4 },  // NR
        { width: 8 },  // RANK
        { width: 30 }, // NAME
        { width: 20 }, // DESIGNATION
        { width: 20 }, // UNIT
        { width: 20 }, // MCA
        { width: 20 }, // AMOUNT OF BOND
        { width: 20 }, // BOND PREMIUM
        { width: 20 }, // RISK NO
        { width: 20 }, // EFFECTIVITY DATE
        { width: 25 }  // DATE OF CANCELLATION
      ];

      // Add borders to all header cells
      [mainHeaderRow, subHeaderRow].forEach(row => {
        row.eachCell((cell: Cell, colNumber: number) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Add data rows
      const data = this.activeBonds.map((bond, index) => ([
        index + 1,
        bond.rank,
        `${bond.first_name} ${bond.middle_name} ${bond.last_name}`,
        bond.designation,
        bond.unit_office,
        parseFloat(bond.mca || '0').toFixed(2),
        parseFloat(bond.amount_of_bond || '0').toFixed(2),
        parseFloat(bond.bond_premium || '0').toFixed(2),
        bond.risk_no,
        bond.effective_date ? new Date(bond.effective_date).toLocaleDateString() : '',
        bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toLocaleDateString() : ''
      ]));

      data.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Format number columns
        row.getCell(6).numFmt = '#,##0.00'; // MCA
        row.getCell(7).numFmt = '#,##0.00'; // AMOUNT OF BOND
        row.getCell(8).numFmt = '#,##0.00'; // BOND PREMIUM
      });

      // Add borders to all cells
      worksheet.eachRow((row: Row, rowNumber: number) => {
        row.eachCell((cell: Cell, colNumber: number) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Bond_Report_${period}.xlsx`);

      await this.logExportActivity();
    } catch (error) {
      console.error('Error exporting report:', error);
      this.error = 'Failed to export report. Please try again.';
    }
  }

  private async logExportActivity() {
    try {
      const { error: activityError } = await this.supabase.getClient()
        .from('fbus_activities')
        .insert([{
          action: 'Exported bond report',
          user_name: await this.getCurrentUserName(),
          created_at: new Date().toISOString()
        }]);

      if (activityError) throw activityError;
    } catch (error) {
      console.error('Error logging export activity:', error);
    }
  }

  private async getBase64Image(imagePath: string): Promise<string> {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  }
}
