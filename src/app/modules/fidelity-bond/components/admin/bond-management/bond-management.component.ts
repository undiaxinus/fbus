import { Component, OnInit, HostListener } from '@angular/core';
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
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { BondHistory } from '../../../models/bond-history.model';
import { DatePipe } from '@angular/common';

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
    FormsModule,
    DatePipe
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
    date_of_cancellation: true,
    contact_no: true
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
    date_of_cancellation: 'DATE OF CANCELLATION',
    contact_no: 'CONTACT NO.'
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
    date_of_cancellation: 25,
    contact_no: 15
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

  showAddBondDropdown: boolean = false;

  isImporting: boolean = false;

  bondHistory: BondHistory[] = [];

  activeTab: 'details' | 'documents' | 'history' = 'details';

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

  showUnitOfficeInput: boolean = false;

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
    
    // Clear all document-related state
    this.documents = {};
    this.designationFiles = [];
    this.riskFiles = [];
    
    // Clear all previews
    this.profileImagePreview = null;
    this.designationImagePreview = null;
    this.riskImagePreview = null;
    
    // Clear all selected files
    this.selectedProfileImage = null;
    this.selectedDesignationImage = null;
    this.selectedRiskImage = null;
  }

  onAddNewBond() {
    // Reset everything before showing the modal
    this.resetForm();
    this.showAddBondModal = true;
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
      await this.logActivity(
        `${this.isEditMode ? 'Updated' : 'Created'} bond for ${bond.first_name} ${bond.last_name}`
      );

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

  private async logActivity(action: string, userName?: string) {
    try {
      const user = userName || await this.getCurrentUserName();
      const { error } = await this.supabase.getClient()
        .from('fbus_activities')
        .insert({
          action: action,
          user_name: user,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Failed to log activity:', error);
        // Don't throw error to allow the main operation to continue
      }
    } catch (error) {
      console.warn('Error logging activity:', error);
      // Don't throw error to allow the main operation to continue
    }
  }

  private async getCurrentUserName(): Promise<string> {
    try {
      const { data: sessionData, error: sessionError } = await this.supabase.getClient()
        .from('users')
        .select('name')
        .limit(1)
        .maybeSingle();

      if (sessionError) {
        console.warn('Error getting user name:', sessionError);
        return 'Unknown User';
      }

      return sessionData?.name || 'Unknown User';
    } catch (error) {
      console.warn('Error getting user name:', error);
      return 'Unknown User';
    }
  }

  async onDeleteBond(bond: FbusBond) {
    if (!confirm(`Are you sure you want to delete the bond for ${bond.first_name} ${bond.last_name}?`)) {
      return;
    }

    try {
      // Create history record before deletion
      await this.createHistoryRecord(bond, 'DELETE');

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
      await this.logActivity(
        `Deleted bond for ${bond.first_name} ${bond.last_name}`,
        userName
      );

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
    this.activeTab = 'details';
    
    // Load documents when opening modal
    if (bond.id) {
      await this.loadDocuments(bond.id);
    }

    // Load history immediately when modal opens
    await this.loadBondHistory();
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
    this.resetForm();
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
            case 'contact_no':
              return bond.contact_no;
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
    await this.logActivity(`Exported bond report as ${type}`);
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
              case 'contact_no':
                return bond.contact_no;
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

      // Get the old bond data before renewal
      const oldBond = { ...this.bondToRenew };

      // Create a new bond object with renewed dates
      const renewedBond: FbusBond = {
        ...this.bondToRenew,
        effective_date: this.today.toISOString().split('T')[0],
        date_of_cancellation: this.oneYearFromNow.toISOString().split('T')[0],
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

      // Create history record for renewal
      await this.createHistoryRecord(renewedBond, 'RENEW', oldBond);

      // Log the activity
      const userName = await this.getCurrentUserName();
      await this.logActivity(
        `Bond renewed for ${renewedBond.first_name} ${renewedBond.last_name}`,
        userName
      );

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

  removeAllRiskFiles() {
    this.riskFiles = [];
  }

  async removeProfileImage() {
    try {
      if (this.documents['profile']) {
        // Store the current document in case we need to restore it
        const currentDoc = this.documents['profile'];
        
        // Clear UI first
        this.profileImagePreview = null;
        this.selectedProfileImage = null;
        
        try {
          await this.documentService.deleteDocument(currentDoc.id);
          // Only remove from documents if delete was successful
          delete this.documents['profile'];
        } catch (error) {
          console.error('Error removing profile image:', error);
          // Restore UI state if delete failed
          this.profileImagePreview = currentDoc.file_url;
          this.documents['profile'] = currentDoc;
          throw error;
        }
      } else {
        // If no document exists, just clear the UI state
        this.profileImagePreview = null;
        this.selectedProfileImage = null;
      }
    } catch (error) {
      console.error('Error in removeProfileImage:', error);
      throw error;
    }
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
      // Handle each document type independently
      const uploadTasks = [];

      // Handle profile image independently - only if there's a new profile image
      if (this.selectedProfileImage && this.selectedProfileImage.size > 0) {
        uploadTasks.push(
          (async () => {
            try {
              if (this.selectedProfileImage instanceof File) {
                // First upload the new document
                const newDocument = await this.documentService.uploadDocument(
                  this.selectedProfileImage,
                  bondId,
                  'profile'
                );

                // Only after successful upload, delete the old one
                const existingProfile = await firstValueFrom(this.documentService.getDocumentByType(bondId, 'profile'));
                if (existingProfile && existingProfile.id !== newDocument.id) {
                  await this.documentService.deleteDocument(existingProfile.id);
                }
              }
            } catch (error) {
              console.error('Error handling profile image:', error);
              // Restore preview if upload fails
              if (this.documents['profile']) {
                this.profileImagePreview = this.documents['profile'].file_url;
              }
              throw error;
            }
          })()
        );
      }

      // Handle designation documents independently - only if there are new designation files
      if (this.designationFiles && this.designationFiles.length > 0) {
        uploadTasks.push(
          (async () => {
            try {
              // Get existing designation documents
              const existingDocs = await firstValueFrom(this.documentService.getDocumentsByType(bondId, 'designation'));
              
              // Only process new files (files with actual size)
              const newFiles = this.designationFiles.filter(file => file.size > 0);
              
              // Keep track of which existing documents to keep
              const existingFilesToKeep = new Set(
                this.designationFiles
                  .filter(file => file.size === 0)
                  .map(file => this.cleanFileName(file.name))
              );

              // Delete only designation documents that are not in the keep list
              for (const doc of existingDocs) {
                try {
                  const cleanedName = this.cleanFileName(doc.file_name);
                  if (!existingFilesToKeep.has(cleanedName)) {
                    await this.documentService.deleteDocument(doc.id);
                  }
                } catch (error) {
                  console.error('Error deleting designation document:', error);
                  // Continue with other operations
                }
              }

              // Upload new designation files
              for (const file of newFiles) {
                try {
                  await this.documentService.uploadDocument(
                    file,
                    bondId,
                    'designation'
                  );
                } catch (error) {
                  console.error('Error uploading designation file:', error);
                  // Continue with other files
                }
              }
            } catch (error) {
              console.error('Error handling designation files:', error);
              // Continue with other document types
            }
          })()
        );
      }

      // Handle risk documents independently - only if there are new risk files
      if (this.riskFiles && this.riskFiles.length > 0) {
        uploadTasks.push(
          (async () => {
            try {
              // Get existing risk documents
              const existingDocs = await firstValueFrom(this.documentService.getDocumentsByType(bondId, 'risk'));
              
              // Only process new files (files with actual size)
              const newFiles = this.riskFiles.filter(file => file.size > 0);
              
              // Keep track of which existing documents to keep
              const existingFilesToKeep = new Set(
                this.riskFiles
                  .filter(file => file.size === 0)
                  .map(file => this.cleanFileName(file.name))
              );

              // Delete only risk documents that are not in the keep list
              for (const doc of existingDocs) {
                try {
                  const cleanedName = this.cleanFileName(doc.file_name);
                  if (!existingFilesToKeep.has(cleanedName)) {
                    await this.documentService.deleteDocument(doc.id);
                  }
                } catch (error) {
                  console.error('Error deleting risk document:', error);
                  // Continue with other operations
                }
              }

              // Upload new risk files
              for (const file of newFiles) {
                try {
                  await this.documentService.uploadDocument(
                    file,
                    bondId,
                    'risk'
                  );
                } catch (error) {
                  console.error('Error uploading risk file:', error);
                  // Continue with other files
                }
              }
            } catch (error) {
              console.error('Error handling risk files:', error);
              // Continue with other document types
            }
          })()
        );
      }

      // Wait for all upload tasks to complete
      await Promise.all(uploadTasks);

    } catch (error: any) {
      console.error('Error uploading documents:', error);
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }

  private getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop();
  }

  private async createBond(bond?: FbusBond) {
    try {
      // First create the bond record
      const { data: bondData, error } = await this.supabase.getClient()
        .from('fbus_list')
        .insert([{
          ...(bond || this.newBond),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      if (!bondData || !bondData.id) throw new Error('Failed to create bond record');

      // Create history record
      await this.createHistoryRecord(bondData, 'CREATE');

      // Then upload documents - only if we're creating from the form
      if (!bond) {
        await this.uploadImages(bondData.id);
      }

      return bondData;
    } catch (error) {
      console.error('Error creating bond:', error);
      throw error;
    }
  }

  private async updateBond() {
    try {
      if (!this.newBond.id) throw new Error('Bond ID is required for update');

      // Get the old bond data before update
      const { data: oldBond } = await this.supabase.getClient()
        .from('fbus_list')
        .select('*')
        .eq('id', this.newBond.id)
        .single();

      // First update the bond record
      const { data: bondData, error } = await this.supabase.getClient()
        .from('fbus_list')
        .update({
          ...this.newBond,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.newBond.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update bond: ${error.message}`);
      }
      if (!bondData || !bondData.id) throw new Error('Failed to update bond record');

      // Create history record with changes
      await this.createHistoryRecord(bondData, 'UPDATE', oldBond);

      // Then upload documents
      await this.uploadImages(bondData.id);

      return bondData;
    } catch (error: any) {
      console.error('Error updating bond:', error);
      throw new Error(`Failed to update bond: ${error.message}`);
    }
  }

  private async createHistoryRecord(bond: FbusBond, changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RENEW', oldBond?: FbusBond) {
    try {
      const historyRecord: BondHistory = {
        bond_id: bond.id!,
        first_name: bond.first_name,
        middle_name: bond.middle_name,
        last_name: bond.last_name,
        unit_office: bond.unit_office,
        rank: bond.rank,
        designation: bond.designation,
        mca: (typeof bond.mca === 'number' ? bond.mca : parseFloat(bond.mca) || 0).toString(),
        amount_of_bond: (typeof bond.amount_of_bond === 'number' ? bond.amount_of_bond : parseFloat(bond.amount_of_bond) || 0).toString(),
        bond_premium: (typeof bond.bond_premium === 'number' ? bond.bond_premium : parseFloat(bond.bond_premium) || 0).toString(),
        risk_no: bond.risk_no,
        effective_date: bond.effective_date,
        date_of_cancellation: bond.date_of_cancellation,
        contact_no: bond.contact_no,
        change_type: changeType,
        created_at: new Date().toISOString()
      };

      // If this is an update, calculate changed fields and values
      if (changeType === 'UPDATE' && oldBond) {
        const changedFields: string[] = [];
        const oldValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};

        const excludedFields = ['id', 'created_at', 'updated_at'];
        Object.keys(bond).forEach(key => {
          if (!excludedFields.includes(key) && 
              JSON.stringify(bond[key as keyof FbusBond]) !== JSON.stringify(oldBond[key as keyof FbusBond])) {
            changedFields.push(key);
            oldValues[key] = oldBond[key as keyof FbusBond];
            newValues[key] = bond[key as keyof FbusBond];
          }
        });

        historyRecord.changed_fields = changedFields;
        historyRecord.old_values = oldValues;
        historyRecord.new_values = newValues;
      }

      const { error } = await this.supabase.getClient()
        .from('fbus_history')
        .insert([historyRecord]);

      if (error) {
        console.warn('Failed to create history record:', error);
      }
    } catch (error) {
      console.warn('Error creating history record:', error);
    }
  }

  private async cleanupImageUrls(bond: FbusBond) {
    try {
      // Only cleanup documents if the bond is being deleted
      if (bond.id && !this.isEditMode) {
        const documents = await firstValueFrom(this.documentService.getDocuments(bond.id));
        for (const doc of documents) {
          try {
            await this.documentService.deleteDocument(doc.id);
          } catch (error) {
            console.warn(`Failed to delete document ${doc.id}:`, error);
            // Continue with other documents
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up documents:', error);
      // Don't throw error to allow the operation to continue
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
          // Group documents by type
          const groupedDocs = documents.reduce((acc, doc) => {
            if (!acc[doc.document_type]) {
              acc[doc.document_type] = [];
            }
            acc[doc.document_type].push(doc);
            return acc;
          }, {} as { [key: string]: FbusDocument[] });

          // Handle each document type independently
          // Only update the specific document type that exists, preserve others
          
          // Handle profile document
          if (groupedDocs['profile']?.[0]) {
            this.documents['profile'] = groupedDocs['profile'][0];
            this.profileImagePreview = groupedDocs['profile'][0].file_url;
          }

          // Handle designation documents
          if (groupedDocs['designation']) {
            this.designationFiles = []; // Reset only designation files
            groupedDocs['designation'].forEach(doc => {
              const cleanedName = this.cleanFileName(doc.file_name);
              const file = new File([], cleanedName, {
                type: doc.mime_type,
                lastModified: new Date(doc.updated_at).getTime()
              });
              Object.defineProperty(file, 'size', {
                value: doc.file_size
              });
              this.designationFiles.push(file);
            });
            // Store the first designation document reference
            this.documents['designation'] = groupedDocs['designation'][0];
          }

          // Handle risk documents
          if (groupedDocs['risk']) {
            this.riskFiles = []; // Reset only risk files
            groupedDocs['risk'].forEach(doc => {
              const cleanedName = this.cleanFileName(doc.file_name);
              const file = new File([], cleanedName, {
                type: doc.mime_type,
                lastModified: new Date(doc.updated_at).getTime()
              });
              Object.defineProperty(file, 'size', {
                value: doc.file_size
              });
              this.riskFiles.push(file);
            });
            // Store the first risk document reference
            this.documents['risk'] = groupedDocs['risk'][0];
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

  async importExcelBond() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';

    input.onchange = async (e: any) => {
      try {
        this.isImporting = true; // Start loading
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event: any) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert Excel data to JSON with raw values
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              raw: true // Get raw values for better date handling
            });
            
            // Find the starting row of actual data (skip headers)
            let startRow = 0;
            let headerRow = -1;
            for (let i = 0; i < jsonData.length; i++) {
              const currentRow: any = jsonData[i];
              if (currentRow && Array.isArray(currentRow) && currentRow.length > 0) {
                // Check for header row with RANK
                if (currentRow.some(cell => typeof cell === 'string' && 
                    cell.toUpperCase() === 'RANK')) {
                  headerRow = i;
                  startRow = i + 1;
                  break;
                }
              }
            }

            let successCount = 0;
            let errorCount = 0;
            let totalRows = 0;

            // Get column indices from header row
            const headers = jsonData[headerRow] as string[];
            const getColumnIndex = (headerName: string): number => {
              return headers.findIndex((header: string) => 
                header && header.toString().toUpperCase() === headerName.toUpperCase()
              );
            };

            const unitIndex = getColumnIndex('UNIT');
            const rankIndex = getColumnIndex('RANK');
            const nameIndex = getColumnIndex('NAME');
            const designationIndex = getColumnIndex('DESIGNATION');
            const mcaIndex = getColumnIndex('MCA');
            const amountIndex = getColumnIndex('AMOUNT OF BOND');
            const premiumIndex = getColumnIndex('BOND PREMIUM');
            const riskIndex = getColumnIndex('RISK NO.');
            const effectiveIndex = getColumnIndex('EFFECTIVITY DATE');
            const cancellationIndex = getColumnIndex('DATE OF CANCELLATION');
            const contactIndex = getColumnIndex('CONTACT NO.');

            // Count total valid rows first
            totalRows = jsonData.slice(startRow).filter(row => row && Array.isArray(row) && row[rankIndex]).length;

            // Process each row and create bonds
            for (let i = startRow; i < jsonData.length; i++) {
              const currentRow: any = jsonData[i];
              if (!currentRow || currentRow.length === 0 || !currentRow[rankIndex]) continue; // Skip empty rows

              try {
                // Clean up amount values - remove commas and currency symbols
                const cleanAmount = (value: any) => {
                  if (!value) return '0';
                  const cleanedValue = value.toString().replace(/[^\d.]/g, '');
                  return cleanedValue || '0';
                };

                // Get the unit value and ensure it's not undefined
                const unitValue = currentRow[unitIndex]?.toString().trim() || '';

                // Get and clean the MCA value
                const mcaValue = cleanAmount(currentRow[mcaIndex]);
                console.log('Raw MCA value:', currentRow[mcaIndex], 'Cleaned MCA value:', mcaValue);

                // Get contact number and ensure it's a string
                const contactNumber = currentRow[contactIndex]?.toString().trim() || '';
                console.log('Contact number:', contactNumber);

                // Split the full name into parts
                const fullName = currentRow[nameIndex]?.toString().trim() || '';
                const nameParts = fullName.split(' ').filter((part: string) => part.length > 0);
                let firstName = '';
                let middleName = '';
                let lastName = '';

                if (nameParts.length >= 2) {
                  firstName = nameParts[0];
                  lastName = nameParts[nameParts.length - 1];
                  if (nameParts.length > 2) {
                    middleName = nameParts.slice(1, -1).join(' ');
                  }
                } else {
                  firstName = fullName; // If only one word, put it all in first name
                }

                // Create bond object with proper data handling
                const newBondData: FbusBond = {
                  rank: currentRow[rankIndex]?.toString().trim() || '',
                  first_name: firstName,
                  middle_name: middleName,
                  last_name: lastName,
                  designation: currentRow[designationIndex]?.toString().trim() || '',
                  unit_office: unitValue,
                  mca: mcaValue,
                  amount_of_bond: cleanAmount(currentRow[amountIndex]),
                  bond_premium: cleanAmount(currentRow[premiumIndex]),
                  risk_no: currentRow[riskIndex]?.toString().trim() || '',
                  effective_date: this.formatDateForSupabase(currentRow[effectiveIndex]),
                  date_of_cancellation: this.formatDateForSupabase(currentRow[cancellationIndex]),
                  status: 'VALID',
                  days_remaning: '0',
                  contact_no: contactNumber,
                  units: unitValue,
                  profile: '',
                  remark: '',
                  is_archived: false,
                  despic: '',
                  riskpic: ''
                };

                // Log the data being processed
                console.log('Processing row:', {
                  rowNumber: i + 1,
                  rawData: currentRow,
                  formattedData: newBondData,
                  progress: `${successCount + errorCount + 1}/${totalRows}`
                });

                await this.createBond(newBondData);
                successCount++;
                console.log('Successfully created bond:', newBondData);
              } catch (error) {
                errorCount++;
                console.error('Error creating bond at row', i + 1, ':', error, 'Row data:', currentRow);
              }
            }

            console.log(`Import completed. Success: ${successCount}, Errors: ${errorCount}, Total: ${totalRows}`);
            alert(`Import completed!\nSuccessfully imported: ${successCount}\nErrors: ${errorCount}\nTotal rows: ${totalRows}`);
            await this.loadBonds();
            
          } catch (error) {
            console.error('Error processing Excel file:', error);
            alert('Error processing Excel file. Please check the console for details.');
          } finally {
            this.isImporting = false; // End loading
          }
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
        this.isImporting = false; // End loading on error
      }
    };

    input.click();
  }

  private formatDateForSupabase(dateValue: any): string {
    try {
      if (!dateValue) return '';

      // If it's a risk number that contains dashes (like "23-24-00209N"), return as is
      if (typeof dateValue === 'string' && dateValue.includes('-') && dateValue.length > 8) {
        return dateValue;
      }

      // Handle string date in M/D/YYYY format
      if (typeof dateValue === 'string') {
        const cleanDate = dateValue.toString().trim();
        const parts = cleanDate.split('/');
        
        if (parts.length === 3) {
          let month = parseInt(parts[0], 10);
          let day = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          
          // Validate date parts
          if (!isNaN(month) && !isNaN(day) && !isNaN(year) &&
              month >= 1 && month <= 12 &&
              day >= 1 && day <= 31) {
            
            // Format as MM/DD/YY
            const mm = String(month).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const yy = year.toString().slice(-2);
            return `${mm}/${dd}/${yy}`;
          }
        }
      }

      // Handle Excel date serial number
      if (typeof dateValue === 'number') {
        const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${month}/${day}/${year}`;
      }

      console.warn('Could not parse date value:', dateValue);
      return '';
    } catch (error) {
      console.error('Error formatting date:', error, 'Value:', dateValue);
      return '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.add-bond-dropdown')) {
      this.showAddBondDropdown = false;
    }
  }

  async loadBondHistory() {
    if (!this.selectedBond?.id) return;

    try {
      this.isLoading = true;
      console.log('Fetching history for bond ID:', this.selectedBond.id);
      
      const { data: history, error } = await this.supabase.getClient()
        .from('fbus_history')
        .select(`
          *,
          bond:bond_id (
            id,
            first_name,
            last_name,
            unit_office,
            risk_no
          )
        `)
        .eq('bond_id', this.selectedBond.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        throw error;
      }

      console.log('Fetched history records:', history);
      this.bondHistory = history || [];
    } catch (error) {
      console.error('Error loading bond history:', error);
      this.error = 'Failed to load bond history';
    } finally {
      this.isLoading = false;
    }
  }

  // Add method to handle row click
  onHistoryRowClick(record: BondHistory) {
    console.log('History record details:', record);
    // You can add additional logic here to show more details
  }

  getHistoryBadgeColor(changeType: string): string {
    switch (changeType) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'RENEW':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getHistoryDescription(record: BondHistory): string {
    switch (record.change_type) {
      case 'CREATE':
        return `Bond was created for ${record.first_name} ${record.last_name}`;
      case 'UPDATE':
        return `Bond details were updated for ${record.first_name} ${record.last_name}`;
      case 'DELETE':
        return `Bond was deleted for ${record.first_name} ${record.last_name}`;
      case 'RENEW':
        return `Bond was renewed for ${record.first_name} ${record.last_name}`;
      default:
        return 'Bond was modified';
    }
  }

  formatFieldName(field: string): string {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatFieldValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return new Date(value).toLocaleDateString();
    return value.toString();
  }

  // Add method to handle tab changes
  async onTabChange(tab: 'details' | 'documents' | 'history') {
    this.activeTab = tab;
    if (tab === 'history') {
      await this.loadBondHistory();
    }
  }

  onUnitOfficeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select) {
      this.newBond.unit_office = select.value;
    }
  }

  onUnitOfficeSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select) {
      const selectedValue = select.value;
      if (selectedValue === 'others') {
        this.showUnitOfficeInput = true;
        this.newBond.unit_office = ''; // Clear the input when selecting "Others"
      } else {
        this.showUnitOfficeInput = false;
        this.newBond.unit_office = selectedValue;
      }
    }
  }
}
