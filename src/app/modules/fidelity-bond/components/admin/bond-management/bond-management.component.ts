import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { StorageService } from '../../../services/storage.service';
import { firstValueFrom } from 'rxjs';
import { delay, retryWhen, take, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook, Row, Cell } from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { UserOptions } from 'jspdf-autotable';

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
  profile_image_url?: string;
  designation_image_url?: string;
  risk_image_url?: string;
}

interface FbusSignatory {
  id: string;
  position_title: string;
  name: string;
  rank: string;
  designation: string;
  office: string;
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
    
    @media print {
      .print-table {
        width: 100%;
        border-collapse: collapse;
      }
      .print-table th, .print-table td {
        border: 1px solid black;
        padding: 8px;
        text-align: center;
      }
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
  statuses: string[] = ['VALID', 'EXPIRE SOON'];

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

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;

  showExportMenu = false;

  signatories: {
    preparedBy?: FbusSignatory;
    certifiedBy?: FbusSignatory;
    notedBy?: FbusSignatory;
  } = {};

  showExpiredBondsModal: boolean = false;
  expiredBonds: FbusBond[] = [];
  showRenewalModal: boolean = false;
  bondToRenew: FbusBond | null = null;
  today: Date = new Date();
  oneYearFromNow: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  profileImagePreview: string | null = null;
  designationImagePreview: string | null = null;
  riskImagePreview: string | null = null;
  selectedProfileImage: File | null = null;
  selectedDesignationImage: File | null = null;
  selectedRiskImage: File | null = null;

  showFullSizeImage: boolean = false;
  selectedImageUrl: string | null = null;

  get totalPages() {
    return Math.ceil(this.filteredBonds.length / this.itemsPerPage);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    const end = this.startIndex + this.itemsPerPage;
    return Math.min(end, this.filteredBonds.length);
  }

  get paginatedBonds() {
    return this.filteredBonds.slice(this.startIndex, this.endIndex);
  }

  get filteredExpiredBonds(): FbusBond[] {
    return this.activeBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRED');
  }

  constructor(
    private supabase: SupabaseService,
    private storageService: StorageService,
  ) {}

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

      // Load signatories
      await this.loadSignatories();

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
        this.bonds = data;
        this.activeBonds = data.filter(bond => !bond.is_archived);
        this.archivedBonds = data.filter(bond => bond.is_archived);
        this.expiredBonds = this.filteredExpiredBonds;
      }
    } catch (error: any) {
      throw error;
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

  async loadSignatories() {
    try {
      const { data, error } = await this.retryOperation(async () => {
        return await this.supabase.getClient()
          .from('fbus_signatories')
          .select('*')
          .is('deleted_at', null);
      });

      if (error) {
        console.error('Error loading signatories:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Assign signatories based on their position_title
        this.signatories = {
          preparedBy: data.find(sig => sig.position_title === 'Prepared By'),
          certifiedBy: data.find(sig => sig.position_title === 'Certified Correct'),
          notedBy: data.find(sig => sig.position_title === 'Noted by')
        };
        console.log('Loaded signatories:', this.signatories);
      } else {
        console.log('No signatories found in database');
        // Set default values if no data is found
        this.signatories = {
          preparedBy: {
            id: '1',
            position_title: 'Prepared By',
            name: 'MAY LANNIE B ESPIRITU',
            rank: 'Non-Uniformed Personnel',
            designation: 'MODE Examiner, RFU-5',
            office: 'RFU-5'
          },
          certifiedBy: {
            id: '2',
            position_title: 'Certified Correct',
            name: 'BRYAN JOHN D BACCAY',
            rank: 'Police Major',
            designation: 'Chief Disbursement Section, RFU-5',
            office: 'RFU-5'
          },
          notedBy: {
            id: '3',
            position_title: 'Noted by',
            name: 'JENNIFER N BELMONTE',
            rank: 'Police Colonel',
            designation: 'Chief, RFU-5',
            office: 'RFU-5'
          }
        };
      }
    } catch (error) {
      console.error('Error loading signatories:', error);
      // Set default values in case of error
      this.signatories = {
        preparedBy: {
          id: '1',
          position_title: 'Prepared By',
          name: 'MAY LANNIE B ESPIRITU',
          rank: 'Non-Uniformed Personnel',
          designation: 'MODE Examiner, RFU-5',
          office: 'RFU-5'
        },
        certifiedBy: {
          id: '2',
          position_title: 'Certified Correct',
          name: 'BRYAN JOHN D BACCAY',
          rank: 'Police Major',
          designation: 'Chief Disbursement Section, RFU-5',
          office: 'RFU-5'
        },
        notedBy: {
          id: '3',
          position_title: 'Noted by',
          name: 'JENNIFER N BELMONTE',
          rank: 'Police Colonel',
          designation: 'Chief, RFU-5',
          office: 'RFU-5'
        }
      };
    }
  }

  get filteredBonds(): FbusBond[] {
    let bonds = this.viewMode === 'active' ? this.activeBonds : this.archivedBonds;
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      bonds = bonds.filter(bond => 
        bond.first_name?.toLowerCase().includes(searchLower) ||
        bond.middle_name?.toLowerCase().includes(searchLower) ||
        bond.last_name?.toLowerCase().includes(searchLower) ||
        bond.unit_office?.toLowerCase().includes(searchLower) ||
        bond.risk_no?.toLowerCase().includes(searchLower) ||
        bond.contact_no?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      bonds = bonds.filter(bond => this.calculateBondStatus(bond) === this.selectedStatus);
    } else {
      // Exclude expired bonds from main table
      bonds = bonds.filter(bond => this.calculateBondStatus(bond) !== 'EXPIRED');
    }

    // Apply department filter
    if (this.selectedDepartment !== 'all') {
      bonds = bonds.filter(bond => bond.unit_office === this.selectedDepartment);
    }

    return bonds;
  }

  async onSubmitBond(form: NgForm) {
    if (!form.valid) return;

    this.isSubmitting = true;
    this.error = null;

    try {
      // Upload images if selected
      if (this.selectedProfileImage) {
        try {
          const profileUrl = await this.storageService.uploadProfileImage(this.selectedProfileImage);
          this.newBond.profile_image_url = profileUrl;
        } catch (error) {
          console.error('Error uploading profile image:', error);
          throw new Error('Failed to upload profile image. Please try again.');
        }
      }

      if (this.selectedDesignationImage) {
        try {
          const designationUrl = await this.storageService.uploadDesignationImage(this.selectedDesignationImage);
          this.newBond.designation_image_url = designationUrl;
        } catch (error) {
          console.error('Error uploading designation image:', error);
          throw new Error('Failed to upload designation image. Please try again.');
        }
      }

      if (this.selectedRiskImage) {
        try {
          const riskUrl = await this.storageService.uploadRiskImage(this.selectedRiskImage);
          this.newBond.risk_image_url = riskUrl;
        } catch (error) {
          console.error('Error uploading risk image:', error);
          throw new Error('Failed to upload risk image. Please try again.');
        }
      }

      // Continue with existing bond submission logic
      if (this.isEditMode) {
        await this.updateBond();
      } else {
        await this.createBond();
      }

      // Reset form and close modal only if everything succeeds
      this.resetForm();
      this.showAddBondModal = false;
      await this.loadBonds();

    } catch (error: any) {
      console.error('Error submitting bond:', error);
      this.error = error?.message || 'Failed to submit bond. Please try again.';
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

      // Clear any existing error
      this.error = null;

      // Cleanup image URLs if bond exists
      if (this.bondToArchive) {
        await this.cleanupImageUrls(this.bondToArchive);
      }

      this.showArchiveConfirmModal = false;
      this.bondToArchive = null;
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
    this.currentPage = 1;
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

      // Add empty rows for spacing
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add signature section
      const signatureSection = [
        ['Prepared By:', '', 'Certified Correct:', '', 'Noted by:', ''],
        ['', '', '', '', '', ''],
        [
          this.signatories.preparedBy?.name || 'MAY LANNIE B ESPIRITU',
          '',
          this.signatories.certifiedBy?.name || 'BRYAN JOHN D BACCAY',
          '',
          this.signatories.notedBy?.name || 'JENNIFER N BELMONTE',
          ''
        ],
        [
          this.signatories.preparedBy?.rank || 'Non-Uniformed Personnel',
          '',
          this.signatories.certifiedBy?.rank || 'Police Major',
          '',
          this.signatories.notedBy?.rank || 'Police Colonel',
          ''
        ],
        [
          this.signatories.preparedBy?.designation || 'MODE Examiner, RFU-5',
          '',
          this.signatories.certifiedBy?.designation || 'Chief Disbursement Section, RFU-5',
          '',
          this.signatories.notedBy?.designation || 'Chief, RFU-5',
          ''
        ]
      ];

      signatureSection.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Merge cells for each signature section
      const lastRowNum = worksheet.rowCount;
      const signatureStartRow = lastRowNum - 4;
      
      // Merge cells for each section (2 columns each)
      ['A:B', 'E:F', 'I:J'].forEach((cols, index) => {
        for (let i = 0; i < 5; i++) {
          worksheet.mergeCells(`${cols.split(':')[0]}${signatureStartRow + i}:${cols.split(':')[1]}${signatureStartRow + i}`);
        }
      });

      // Generate and save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Bond_Report_${period}.xlsx`);

      await this.logExportActivity('Excel');
    } catch (error) {
      console.error('Error exporting report:', error);
      this.error = 'Failed to export report. Please try again.';
    }
  }

  private async logExportActivity(type: string = 'Excel') {
    try {
      const { error: activityError } = await this.supabase.getClient()
        .from('fbus_activities')
        .insert([{
          action: `Exported bond report as ${type}`,
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

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Reset pagination when filters change
  onSearch() {
    this.currentPage = 1;
  }

  async exportToPDF() {
    try {
      const currentDate = new Date();
      const period = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase() + ' ' + currentDate.getFullYear();
      
      // Create PDF in landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add logos
      const pdfLogoWidth = 20;
      const pdfLogoHeight = 20;
      const pdfLeftLogoX = 30;
      const pdfRightLogoX = pdf.internal.pageSize.width - 50;
      const pdfLogosY = 15;

      // Load and add logos
      const pdfLogo1 = await this.getBase64Image('/assets/logo.png');
      const pdfLogo2 = await this.getBase64Image('/assets/finance.png');
      pdf.addImage(pdfLogo1, 'PNG', pdfLeftLogoX, pdfLogosY, pdfLogoWidth, pdfLogoHeight);
      pdf.addImage(pdfLogo2, 'PNG', pdfRightLogoX, pdfLogosY, pdfLogoWidth, pdfLogoHeight);

      // Add headers
      pdf.setFontSize(12);
      const pdfCenterX = pdf.internal.pageSize.width / 2;
      let pdfCurrentY = 15;
      const pdfLineSpacing = 7;

      const pdfHeaders = [
        'Republic of the Philippines',
        'National Police Commission',
        'PHILIPPINE NATIONAL POLICE',
        'Regional Finance Unit-5',
        'Camp BGen Simeon A Ola, Legacy City',
        'List of NSU PNP Accountable Officers/Employees',
        'Other Accountable Officers/Finance PNCOs',
        `Period Covered: ${period}`
      ];

      pdfHeaders.forEach((header) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(header, pdfCenterX, pdfCurrentY, { align: 'center' });
        pdfCurrentY += pdfLineSpacing;
      });

      // Configure table
      const tableConfig: UserOptions = {
        head: [
          [
            { content: 'NR', rowSpan: 2 },
            { content: 'RANK', rowSpan: 2 },
            { content: 'NAME', rowSpan: 2 },
            { content: 'DESIGNATION', rowSpan: 2 },
            { content: 'UNIT', rowSpan: 2 },
            { content: 'MCA', rowSpan: 2 },
            { content: 'FIDELITY BOND', colSpan: 5 }
          ],
          [
            'AMOUNT\nOF BOND',
            'BOND\nPREMIUM',
            'RISK NO.',
            'EFFECTIVITY\nDATE',
            'DATE OF\nCANCELLATION'
          ]
        ],
        body: this.activeBonds.map((bond, index) => [
          (index + 1).toString(),
          bond.rank,
          `${bond.first_name} ${bond.middle_name} ${bond.last_name}`,
          bond.designation,
          bond.unit_office,
          this.formatCurrency(bond.mca),
          this.formatCurrency(bond.amount_of_bond),
          this.formatCurrency(bond.bond_premium),
          bond.risk_no,
          bond.effective_date ? new Date(bond.effective_date).toLocaleDateString() : '',
          bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toLocaleDateString() : ''
        ]),
        startY: pdfCurrentY + 5,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          halign: 'center'
        } as const,
        columnStyles: {
          0: { cellWidth: 10 },  // NR
          1: { cellWidth: 15 },  // RANK
          2: { cellWidth: 40 },  // NAME
          3: { cellWidth: 30 },  // DESIGNATION
          4: { cellWidth: 30 },  // UNIT
          5: { cellWidth: 25 },  // MCA
          6: { cellWidth: 25 },  // AMOUNT OF BOND
          7: { cellWidth: 25 },  // BOND PREMIUM
          8: { cellWidth: 25 },  // RISK NO
          9: { cellWidth: 25 },  // EFFECTIVITY DATE
          10: { cellWidth: 25 }  // DATE OF CANCELLATION
        }
      };

      // Add table to PDF
      autoTable(pdf, tableConfig);

      // Add signature section
      const pdfSignatureY = pdf.internal.pageSize.height - 40;
      const pdfSignatureLeftX = 30;
      const pdfSignatureCenterX = pdf.internal.pageSize.width / 2;
      const pdfSignatureRightX = pdf.internal.pageSize.width - 60;
      const pdfSignatureSpacing = 7;

      // Function to add signature block
      const addSignatureBlock = (x: number, title: string, signatory: FbusSignatory | undefined, defaultName: string, defaultRank: string, defaultDesignation: string) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(title, x, pdfSignatureY, { align: 'center' });
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(signatory?.name || defaultName, x, pdfSignatureY + pdfSignatureSpacing * 2, { align: 'center' });
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(signatory?.rank || defaultRank, x, pdfSignatureY + pdfSignatureSpacing * 3, { align: 'center' });
        pdf.text(signatory?.designation || defaultDesignation, x, pdfSignatureY + pdfSignatureSpacing * 4, { align: 'center' });
      };

      // Add the three signature blocks
      addSignatureBlock(
        pdfSignatureLeftX + 30,
        'Prepared By:',
        this.signatories.preparedBy,
        'MAY LANNIE B ESPIRITU',
        'Non-Uniformed Personnel',
        'MODE Examiner, RFU-5'
      );
      addSignatureBlock(
        pdfSignatureCenterX,
        'Certified Correct:',
        this.signatories.certifiedBy,
        'BRYAN JOHN D BACCAY',
        'Police Major',
        'Chief Disbursement Section, RFU-5'
      );
      addSignatureBlock(
        pdfSignatureRightX,
        'Noted by:',
        this.signatories.notedBy,
        'JENNIFER N BELMONTE',
        'Police Colonel',
        'Chief, RFU-5'
      );

      // Save PDF
      pdf.save(`Bond_Report_${period}.pdf`);

      // Log the activity
      await this.logExportActivity('PDF');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      this.error = 'Failed to export PDF. Please try again.';
    }
  }

  async onRenewBond(bond: FbusBond) {
    this.bondToRenew = bond;
    this.today = new Date();
    this.oneYearFromNow = new Date(this.today);
    this.oneYearFromNow.setFullYear(this.today.getFullYear() + 1);
    this.showRenewalModal = true;
  }

  async confirmRenewalBond() {
    try {
      if (!this.bondToRenew) return;

      // Create a new bond object with renewed dates
      const renewedBond: FbusBond = {
        ...this.bondToRenew,
        effective_date: this.today.toISOString().split('T')[0], // Set to today
        date_of_cancellation: this.oneYearFromNow.toISOString().split('T')[0], // Set to 1 year from today
        status: 'VALID',
        days_remaning: '365',
        updated_at: new Date().toISOString()
      };

      // Update the bond in the database
      const { error } = await this.supabase.getClient()
        .from('fbus_list')
        .update(renewedBond)
        .eq('id', renewedBond.id);

      if (error) throw error;

      // Log the activity
      const userName = await this.getCurrentUserName();
      await this.supabase.getClient()
        .from('fbus_activities')
        .insert({
          action: `Bond renewed for ${renewedBond.first_name} ${renewedBond.last_name}`,
          user: userName,
          timestamp: new Date().toISOString()
        });

      // Reload bonds and close modal
      await this.loadBonds();
      this.showRenewalModal = false;
      this.bondToRenew = null;
      this.showExpiredBondsModal = false;

    } catch (error) {
      console.error('Error renewing bond:', error);
      this.error = 'Failed to renew bond. Please try again.';
    }
  }

  async onProfileImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        this.error = 'Profile image size must be less than 5MB';
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.error = 'Only image files are allowed for profile picture';
        return;
      }
      this.selectedProfileImage = file;
      this.profileImagePreview = URL.createObjectURL(file);
    }
  }

  async onDesignationImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        this.error = 'Designation image size must be less than 5MB';
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.error = 'Only image files are allowed for designation';
        return;
      }
      this.selectedDesignationImage = file;
      this.designationImagePreview = URL.createObjectURL(file);
    }
  }

  async onRiskImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        this.error = 'Risk image size must be less than 5MB';
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.error = 'Only image files are allowed for risk document';
        return;
      }
      this.selectedRiskImage = file;
      this.riskImagePreview = URL.createObjectURL(file);
    }
  }

  removeProfileImage() {
    this.selectedProfileImage = null;
    this.profileImagePreview = null;
  }

  removeDesignationImage() {
    this.selectedDesignationImage = null;
    this.designationImagePreview = null;
  }

  removeRiskImage() {
    this.selectedRiskImage = null;
    this.riskImagePreview = null;
  }

  private async uploadImage(file: File, bucket: string): Promise<string> {
    return this.storageService.uploadFile(file, bucket);
  }

  private async createBond() {
    const bondData = { ...this.newBond };
    const { data, error } = await this.supabase.getClient()
      .from('fbus_list')
      .insert([bondData])
      .select();

    if (error) throw error;

    if (data) {
      // Log the activity
      const { error: activityError } = await this.supabase.getClient()
        .from('fbus_activities')
        .insert([{
          action: `Added new bond for ${bondData.first_name} ${bondData.last_name}`,
          user_name: await this.getCurrentUserName(),
          created_at: new Date().toISOString()
        }]);

      if (activityError) throw activityError;

      this.activeBonds = [data[0], ...this.activeBonds];
      this.resetForm();
    }
  }

  private async updateBond() {
    const bondData = { ...this.newBond };
    const { data, error } = await this.supabase.getClient()
      .from('fbus_list')
      .update(bondData)
      .eq('id', this.newBond.id)
      .select();

    if (error) throw error;

    if (data) {
      // Log the activity
      const { error: activityError } = await this.supabase.getClient()
        .from('fbus_activities')
        .insert([{
          action: `Updated bond for ${bondData.first_name} ${bondData.last_name}`,
          user_name: await this.getCurrentUserName(),
          created_at: new Date().toISOString()
        }]);

      if (activityError) throw activityError;

      const index = this.activeBonds.findIndex(b => b.id === this.newBond.id);
      if (index !== -1) {
        this.activeBonds[index] = data[0];
      }
      this.resetForm();
    }
  }

  private resetForm() {
    this.isEditMode = false;
    this.newBond = this.getEmptyBond();
    this.removeProfileImage();
    this.removeDesignationImage();
    this.removeRiskImage();
  }

  private async cleanupImageUrls(bond: FbusBond) {
    try {
      if (bond.profile_image_url) {
        await this.storageService.deleteFile(bond.profile_image_url);
      }

      if (bond.designation_image_url) {
        await this.storageService.deleteFile(bond.designation_image_url);
      }

      if (bond.risk_image_url) {
        await this.storageService.deleteFile(bond.risk_image_url);
      }
    } catch (error) {
      console.error('Error cleaning up image files:', error);
    }
  }
}
