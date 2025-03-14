import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { StorageService } from '../../../services/storage.service';
import { DocumentService, FbusDocument } from '../../../services/document.service';
import { firstValueFrom } from 'rxjs';
import { delay, retryWhen, take, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Workbook, Row, Cell } from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { UserOptions } from 'jspdf-autotable';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';

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
  imports: [
    CommonModule,
    FormsModule
  ],
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
  `],
  providers: [DocumentService, StorageService]
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
  selectedColumns: { [key: string]: boolean } = {
    nr: true,
    rank: true,
    name: true,
    designation: true,
    unit: true,
    mca: true,
    amount_of_bond: true,
    bond_premium: true,
    risk_no: true,
    effective_date: true,
    date_of_cancellation: true
  };

  columnLabels: { [key: string]: string } = {
    nr: 'NR',
    rank: 'RANK',
    name: 'NAME',
    designation: 'DESIGNATION',
    unit: 'UNIT',
    mca: 'MCA',
    amount_of_bond: 'AMOUNT OF BOND',
    bond_premium: 'BOND PREMIUM',
    risk_no: 'RISK NO.',
    effective_date: 'EFFECTIVITY DATE',
    date_of_cancellation: 'DATE OF CANCELLATION'
  };

  columnWidths: { [key: string]: number } = {
    nr: 4,
    rank: 8,
    name: 30,
    designation: 20,
    unit: 20,
    mca: 20,
    amount_of_bond: 20,
    bond_premium: 20,
    risk_no: 20,
    effective_date: 20,
    date_of_cancellation: 25
  };

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

  documents: { [key: string]: FbusDocument } = {};

  designationFiles: File[] = [];
  riskFiles: File[] = [];

  showDocumentListModal = false;
  selectedDocumentType: 'designation' | 'risk' | null = null;
  documentsList: FbusDocument[] = [];

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
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
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

  private async loadBonds() {
    try {
      const { data: bonds, error } = await this.supabase.getClient()
          .from('fbus_list')
          .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.bonds = bonds || [];
      this.activeBonds = this.bonds.filter(bond => !bond.is_archived);
      this.archivedBonds = this.bonds.filter(bond => bond.is_archived);

      // Load documents for each bond
      for (const bond of this.bonds) {
        if (bond.id) {
          await this.loadDocuments(bond.id);
        }
      }

    } catch (error) {
      console.error('Error loading bonds:', error);
      this.error = 'Failed to load bonds. Please try again.';
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

  resetForm() {
    this.isEditMode = false;
    this.newBond = this.getEmptyBond();
    this.removeProfileImage();
    this.removeDesignationImage();
    this.removeRiskImage();
    this.profileImagePreview = null;
    this.designationImagePreview = null;
    this.riskImagePreview = null;
    this.selectedProfileImage = null;
    this.selectedDesignationImage = null;
    this.selectedRiskImage = null;
  }

  async onSubmit(form: NgForm) {
    if (!form.valid) return;

    this.isSubmitting = true;
    this.error = null;

    try {
      let bond;
      if (this.isEditMode) {
        bond = await this.updateBond();
      } else {
        bond = await this.createBond();
      }

      // Log the activity
      const userName = await this.getCurrentUserName();
      await this.supabase.getClient()
        .from('fbus_activities')
        .insert({
          action: `${this.isEditMode ? 'Updated' : 'Created'} bond for ${bond.first_name} ${bond.last_name}`,
          user: userName,
          timestamp: new Date().toISOString()
        });

      // Reset form and reload bonds
      this.resetForm();
      await this.loadBonds();
      this.showAddBondModal = false;

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
    if (!confirm(`Are you sure you want to delete the bond for ${bond.first_name} ${bond.last_name}?`)) {
      return;
    }

      try {
      // Clean up documents first
      await this.cleanupImageUrls(bond);

      // Delete the bond
        const { error } = await this.supabase.getClient()
          .from('fbus_list')
          .delete()
          .eq('id', bond.id);

        if (error) throw error;

      // Log the activity
      const userName = await this.getCurrentUserName();
      await this.supabase.getClient()
        .from('fbus_activities')
        .insert({
          action: `Deleted bond for ${bond.first_name} ${bond.last_name}`,
          user: userName,
          timestamp: new Date().toISOString()
        });

      // Remove from local array and reset selected bond
        this.bonds = this.bonds.filter(b => b.id !== bond.id);
      if (this.selectedBond?.id === bond.id) {
        this.selectedBond = null;
        this.showViewBondModal = false;
      }

      } catch (error) {
        console.error('Error deleting bond:', error);
        this.error = 'Failed to delete bond. Please try again.';
    }
  }

  async onEditBond(bond: FbusBond) {
    try {
      this.isEditMode = true;
      this.newBond = { ...bond };
      
      // Reset document arrays and previews
      this.designationFiles = [];
      this.riskFiles = [];
      this.profileImagePreview = null;
      this.designationImagePreview = null;
      this.riskImagePreview = null;
      
      // Load documents and set up previews
      if (bond.id) {
        await this.loadDocuments(bond.id);
      }
      
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

  async onViewBond(bond: FbusBond) {
    this.selectedBond = bond;
    this.showViewBondModal = true;
    if (bond.id) {
      await this.loadDocuments(bond.id);
    }
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

  toggleColumn(column: string) {
    this.selectedColumns[column] = !this.selectedColumns[column];
  }

  getVisibleColumns(): string[] {
    return Object.entries(this.selectedColumns)
      .filter(([_, isVisible]) => isVisible)
      .map(([column]) => column);
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
        tl: { col: 2, row: 3 },
        ext: { width: 80, height: 80 }
      });

      worksheet.addImage(logoId2, {
        tl: { col: 9, row: 3 },
        ext: { width: 80, height: 80 }
      });

      // Get visible columns
      const visibleColumns = this.getVisibleColumns();

      // Create headers based on visible columns
      const mainHeaders = visibleColumns.map(col => this.columnLabels[col]);
      const mainHeaderRow = worksheet.addRow(mainHeaders);
      mainHeaderRow.font = { bold: true };
      mainHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add data rows with only visible columns
      const data = this.filteredBonds.map((bond, index) => {
        return visibleColumns.map(col => {
          switch(col) {
            case 'nr':
              return index + 1;
            case 'rank':
              return bond.rank;
            case 'name':
              return `${bond.first_name} ${bond.middle_name} ${bond.last_name}`;
            case 'designation':
              return bond.designation;
            case 'unit':
              return bond.unit_office;
            case 'mca':
              return this.formatNumberWithCommas(bond.mca || '0');
            case 'amount_of_bond':
              return this.formatNumberWithCommas(bond.amount_of_bond || '0');
            case 'bond_premium':
              return this.formatNumberWithCommas(bond.bond_premium || '0');
            case 'risk_no':
              return bond.risk_no;
            case 'effective_date':
              return bond.effective_date ? new Date(bond.effective_date).toLocaleDateString() : '';
            case 'date_of_cancellation':
              return bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toLocaleDateString() : '';
            default:
              return '';
          }
        });
      });

      // Add data rows
      data.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Format number columns if they are visible
        if (visibleColumns.includes('mca')) {
          const mcaIndex = visibleColumns.indexOf('mca') + 1;
          row.getCell(mcaIndex).numFmt = '#,##0.00';
        }
        if (visibleColumns.includes('amount_of_bond')) {
          const amountIndex = visibleColumns.indexOf('amount_of_bond') + 1;
          row.getCell(amountIndex).numFmt = '#,##0.00';
        }
        if (visibleColumns.includes('bond_premium')) {
          const premiumIndex = visibleColumns.indexOf('bond_premium') + 1;
          row.getCell(premiumIndex).numFmt = '#,##0.00';
        }
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

      // Set column widths based on visible columns
      worksheet.columns = visibleColumns.map(col => ({
        width: this.columnWidths[col]
      }));

      // Add empty rows for spacing
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add signature section
      const signatureSection = [
        ['Prepared By:', '', '', '', 'Certified Correct:', '', '', '', 'Noted by:', '', ''],
        ['', '', '', '', '', '', '', '', '', '', ''],
        [
          this.signatories.preparedBy?.name || 'MAY LANNIE B ESPIRITU',
          '', '', '',
          this.signatories.certifiedBy?.name || 'BRYAN JOHN D BACCAY',
          '', '', '',
          this.signatories.notedBy?.name || 'JENNIFER N BELMONTE',
          '', '', ''
        ],
        [
          this.signatories.preparedBy?.rank || 'Non-Uniformed Personnel',
          '', '', '',
          this.signatories.certifiedBy?.rank || 'Police Major',
          '', '', '',
          this.signatories.notedBy?.rank || 'Police Colonel',
          '', '', ''
        ],
        [
          this.signatories.preparedBy?.designation || 'MODE Examiner, RFU-5',
          '', '', '',
          this.signatories.certifiedBy?.designation || 'Chief Disbursement Section, RFU-5',
          '', '', '',
          this.signatories.notedBy?.designation || 'Chief, RFU-5',
          '', '', ''
        ]
      ];

      signatureSection.forEach(rowData => {
        const row = worksheet.addRow(rowData);
        row.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Merge cells for each signature section
      const lastRowNum = worksheet.rowCount;
      const signatureStartRow = lastRowNum - 4;
      
      // Merge cells for each section (3 columns each)
      ['A:D', 'E:H', 'I:K'].forEach((cols, index) => {
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
      console.error('Error exporting Excel:', error);
      this.error = 'Failed to export Excel. Please try again.';
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

  formatNumberWithCommas(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

      // Get visible columns
      const visibleColumns = this.getVisibleColumns();

      // Configure table headers based on visible columns
      const tableHeaders = visibleColumns.map(col => ({
        content: this.columnLabels[col],
        styles: { halign: 'center' as const }
      }));

      // Configure table
      const tableConfig: UserOptions = {
        head: [tableHeaders],
        body: this.filteredBonds.map((bond, index) => {
          return visibleColumns.map(col => {
            switch(col) {
              case 'nr':
                return index + 1;
              case 'rank':
                return bond.rank;
              case 'name':
                return `${bond.first_name} ${bond.middle_name} ${bond.last_name}`;
              case 'designation':
                return bond.designation;
              case 'unit':
                return bond.unit_office;
              case 'mca':
                return this.formatNumberWithCommas(bond.mca || '0');
              case 'amount_of_bond':
                return this.formatNumberWithCommas(bond.amount_of_bond || '0');
              case 'bond_premium':
                return this.formatNumberWithCommas(bond.bond_premium || '0');
              case 'risk_no':
                return bond.risk_no;
              case 'effective_date':
                return bond.effective_date ? new Date(bond.effective_date).toLocaleDateString() : '';
              case 'date_of_cancellation':
                return bond.date_of_cancellation ? new Date(bond.date_of_cancellation).toLocaleDateString() : '';
              default:
                return '';
            }
          });
        }),
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
        margin: { bottom: 50 }
      };

      // Add table to PDF and get the final Y position
      let finalY = pdfCurrentY;
      await autoTable(pdf, tableConfig);
      // @ts-ignore jspdf-autotable types are incomplete
      finalY = (pdf as any).lastAutoTable.finalY || pdfCurrentY;

      // Add signature section starting from the table's end position plus some spacing
      const pdfSignatureY = finalY + 20;
      const pdfSignatureLeftX = 30;
      const pdfSignatureCenterX = pdf.internal.pageSize.width / 2;
      const pdfSignatureRightX = pdf.internal.pageSize.width - 60;
      const pdfSignatureSpacing = 8;

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
    if (!file) return;

    try {
      // Check file size (10MB limit)
      if (file.size > 10485760) {
        alert('File size must be less than 10MB');
        return;
      }

      // Show preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profileImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.selectedProfileImage = file;
    } catch (error) {
      console.error('Error handling profile image:', error);
      alert('Error handling file. Please try again.');
    }
  }

  onDesignationImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Add new files to existing array
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
          this.designationFiles.push(file);
        }
      }
    }
  }

  removeDesignationFile(index: number) {
    this.designationFiles.splice(index, 1);
  }

  removeAllDesignationFiles() {
    this.designationFiles = [];
    this.designationImagePreview = null;
  }

  onRiskImageSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
          this.riskFiles.push(file);
        }
      }
    }
  }

  removeRiskFile(index: number): void {
    this.riskFiles.splice(index, 1);
  }

  removeAllRiskFiles(): void {
    this.riskFiles = [];
  }

  async removeProfileImage() {
    if (this.documents['profile']) {
      await this.documentService.deleteDocument(this.documents['profile'].id);
    }
    this.profileImagePreview = null;
    this.selectedProfileImage = null;
  }

  async removeDesignationImage() {
    if (this.documents['designation']) {
      await this.documentService.deleteDocument(this.documents['designation'].id);
    }
    this.designationImagePreview = null;
    this.designationFiles = [];
  }

  async removeRiskImage() {
    if (this.documents['risk']) {
      await this.documentService.deleteDocument(this.documents['risk'].id);
    }
    this.riskImagePreview = null;
    this.selectedRiskImage = null;
  }

  private async uploadImages(bondId: string) {
    try {
      // Upload profile image if exists
      if (this.selectedProfileImage) {
        await this.documentService.uploadDocument(
          this.selectedProfileImage,
          bondId,
          'profile'
        );
      }

      // Upload designation documents if exists
      if (this.designationFiles && this.designationFiles.length > 0) {
        for (const file of this.designationFiles) {
          // Skip if the file is from an existing document (has no actual file data)
          if (file.size === 0) continue;
          
          // Skip if the file is already in the documents list
          const isExistingDoc = this.documents['designation']?.file_name === file.name;
          if (isExistingDoc) continue;
          
          await this.documentService.uploadDocument(
            file,
            bondId,
            'designation'
          );
        }
      }

      // Upload risk documents if exists
      if (this.riskFiles && this.riskFiles.length > 0) {
        for (const file of this.riskFiles) {
          // Skip if the file is from an existing document (has no actual file data)
          if (file.size === 0) continue;
          
          // Skip if the file is already in the documents list
          const isExistingDoc = this.documents['risk']?.file_name === file.name;
          if (isExistingDoc) continue;
          
          await this.documentService.uploadDocument(
            file,
            bondId,
            'risk'
          );
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  private getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop();
  }

  private async createBond() {
    try {
      // First create the bond record
      const { data: bond, error } = await this.supabase.getClient()
      .from('fbus_list')
        .insert([{
          ...this.newBond,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
      if (!bond || !bond.id) throw new Error('Failed to create bond record');

      // Then upload documents
      await this.uploadImages(bond.id);

      return bond;
    } catch (error) {
      console.error('Error creating bond:', error);
      throw error;
    }
  }

  private async updateBond() {
    try {
      if (!this.newBond.id) throw new Error('Bond ID is required for update');

      // First update the bond record
      const { data: bond, error } = await this.supabase.getClient()
      .from('fbus_list')
        .update({
          ...this.newBond,
          updated_at: new Date().toISOString()
        })
      .eq('id', this.newBond.id)
        .select()
        .single();

    if (error) throw error;
      if (!bond || !bond.id) throw new Error('Failed to update bond record');

      // Then upload documents
      await this.uploadImages(bond.id);

      return bond;
    } catch (error) {
      console.error('Error updating bond:', error);
      throw error;
    }
  }

  private async cleanupImageUrls(bond: FbusBond) {
    try {
      if (bond.id) {
        const documents = await firstValueFrom(this.documentService.getDocuments(bond.id));
        for (const doc of documents) {
          await this.documentService.deleteDocument(doc.id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up documents:', error);
    }
  }

  resetColumns() {
    // Set all columns to visible
    Object.keys(this.selectedColumns).forEach(key => {
      this.selectedColumns[key] = true;
    });
  }

  /**
   * Clean up filename for display by removing timestamp and bond ID
   */
  cleanFileName(fileName: string): string {
    // Remove the document type prefix, bond ID, and timestamp
    const parts = fileName.split('_');
    if (parts.length >= 4) {
      // Return everything after the timestamp (original filename)
      return parts.slice(3).join('_');
    }
    return fileName;
  }

  private async loadDocuments(bondId: string) {
    try {
      // Subscribe to documents
      this.documentService.getDocuments(bondId).subscribe(
        (documents: FbusDocument[]) => {
          // Reset all document arrays and previews
          this.profileImagePreview = null;
          this.designationImagePreview = null;
          this.riskImagePreview = null;
          this.designationFiles = [];
          this.riskFiles = [];

          // Group documents by type
          const groupedDocs = documents.reduce((acc, doc) => {
            if (!acc[doc.document_type]) {
              acc[doc.document_type] = [];
            }
            acc[doc.document_type].push(doc);
            return acc;
          }, {} as { [key: string]: FbusDocument[] });

          // Store documents and set previews
          this.documents = {};
          
          // Handle profile document
          if (groupedDocs['profile']?.[0]) {
            this.documents['profile'] = groupedDocs['profile'][0];
            this.profileImagePreview = groupedDocs['profile'][0].file_url;
          }

          // Handle designation documents
          if (groupedDocs['designation']) {
            // Store all designation documents
            groupedDocs['designation'].forEach(doc => {
              // Create a File-like object for each document with cleaned filename
              const cleanedName = this.cleanFileName(doc.file_name);
              const file = new File([], cleanedName, {
                type: doc.mime_type,
                lastModified: new Date(doc.updated_at).getTime()
              });
              Object.defineProperty(file, 'size', {
                value: doc.file_size
              });
              this.designationFiles.push(file);
              // Store the document reference
              if (!this.documents['designation']) {
                this.documents['designation'] = doc;
              }
            });
          }

          // Handle risk documents
          if (groupedDocs['risk']) {
            // Store all risk documents
            groupedDocs['risk'].forEach(doc => {
              // Create a File-like object for each document with cleaned filename
              const cleanedName = this.cleanFileName(doc.file_name);
              const file = new File([], cleanedName, {
                type: doc.mime_type,
                lastModified: new Date(doc.updated_at).getTime()
              });
              Object.defineProperty(file, 'size', {
                value: doc.file_size
              });
              this.riskFiles.push(file);
              // Store the document reference
              if (!this.documents['risk']) {
                this.documents['risk'] = doc;
              }
            });
          }
        },
        (error: Error) => {
          console.error('Error loading documents:', error);
        }
      );
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  getDocumentUrl(type: 'profile' | 'designation' | 'risk'): string | null {
    try {
      const doc = this.documents[type];
      if (!doc || !doc.file_url) return null;
      return doc.file_url;
    } catch (error) {
      console.error(`Error getting document URL for type ${type}:`, error);
      return null;
    }
  }

  openPdfInNewTab(documentUrl: string): void {
    if (!documentUrl) return;
    window.open(documentUrl, '_blank');
  }

  async openDocumentsList(documentType: 'designation' | 'risk') {
    this.selectedDocumentType = documentType;
    this.documentService.getDocumentsByType(this.selectedBond!.id!, documentType)
      .subscribe(documents => {
        this.documentsList = documents;
        this.showDocumentListModal = true;
      });
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isLatestDocument(document: FbusDocument): boolean {
    if (!this.documentsList.length) return false;
    return document.id === this.documentsList[0].id;
  }
}
