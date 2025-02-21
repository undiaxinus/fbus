import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../services/supabase.service';
import { UnitOffice } from '../../../../../models/unit-office.model';

@Component({
  selector: 'app-admin-units',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-units.component.html'
})
export class AdminUnitsComponent implements OnInit {
  units: any[] = [];
  filteredUnits: any[] = [];
  showModal = false;
  showDeleteModal = false;
  showSuccessAlert = false;
  successMessage = '';
  newUnit: UnitOffice = {
    unit: '',
    unit_office: ''
  };
  unitToDelete: UnitOffice | null = null;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Filter property
  filterText = '';
  // Sorting properties
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  // Available units for dropdown
  availableUnits: { unit: string }[] = [];

  constructor(private supabaseService: SupabaseService) {}

  private showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
    }, 3000);
  }

  async ngOnInit() {
    await this.loadUnits();
    await this.loadAvailableUnits();
  }

  async loadAvailableUnits() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_units')
        .select('units')
        .is('deleted_at', null);

      if (error) throw error;
      this.availableUnits = data.map((item: any) => ({
        unit: item.units
      }));
    } catch (error) {
      console.error('Error fetching available units:', error);
    }
  }

  async loadUnits() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .select('*, fbus_units!inner(*)')
        .is('deleted_at', null);

      if (error) throw error;
      this.units = data.map((item: any) => ({
        ...item,
        unit: item.fbus_units.units,
        unit_office: item.unit_office
      }));
      this.applyFilterAndPagination();
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }

  applyFilterAndPagination() {
    // Apply filter
    let filtered = this.units;
    if (this.filterText) {
      const searchText = this.filterText.toLowerCase();
      filtered = this.units.filter(unit =>
        unit.unit.toLowerCase().includes(searchText) ||
        unit.unit_office.toLowerCase().includes(searchText)
      );
    }

    // Apply sorting
    if (this.sortField && this.sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[this.sortField!].toLowerCase();
        const bValue = b[this.sortField!].toLowerCase();
        const direction = this.sortDirection === 'asc' ? 1 : -1;
        return aValue.localeCompare(bValue) * direction;
      });
    }

    // Calculate total pages
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    
    // Ensure current page is within bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    // Get paginated data
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUnits = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  sort(field: string) {
    if (this.sortField === field) {
      // Toggle direction if same field is clicked
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default to ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilterAndPagination();
  }

  onFilter() {
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilterAndPagination();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndPagination();
    }
  }

  async addUnit() {
    try {
      if (!this.newUnit.unit || !this.newUnit.unit_office) {
        console.error('Unit and Unit Office are required');
        return;
      }

      // First, create the unit in fbus_units table
      const { data: unitData, error: unitError } = await this.supabaseService.getClient()
        .from('fbus_units')
        .insert([{
          units: this.newUnit.unit.trim()
        }])
        .select();

      if (unitError) throw unitError;

      // Then create the unit office with the reference to the unit
      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .insert([{
          unit: unitData[0].id,
          unit_office: this.newUnit.unit_office.trim()
        }])
        .select();

      if (error) {
        console.error('Database error:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        await this.loadUnits();
        this.newUnit = { unit: '', unit_office: '' };
        this.showModal = false;
        this.showSuccess('Unit added successfully!');
      } else {
        console.error('No data returned after insert');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      // You might want to show an error message to the user here
    }
  }

  showDeleteConfirmation(unit: UnitOffice) {
    this.unitToDelete = unit;
    this.showDeleteModal = true;
  }

  async confirmDelete() {
    if (this.unitToDelete) {
      try {
        const timestamp = new Date().toISOString();
        const { error } = await this.supabaseService.getClient()
          .from('fbus_unit_office')
          .update({ deleted_at: timestamp })
          .eq('id', this.unitToDelete.id)
          .is('deleted_at', null);

        if (error) throw error;

        await this.loadUnits();
        this.showDeleteModal = false;
        this.unitToDelete = null;
        this.showSuccess('Unit archived successfully!');
      } catch (error) {
        console.error('Error archiving unit:', error);
      }
    }
  }
  // Modal properties
  showArchivedModal = false;
  showRestoreModal = false;
  archivedUnits: any[] = [];
  unitToRestore: UnitOffice | null = null;

  async showArchivedUnits() {
    this.showArchivedModal = true;
    await this.loadArchivedUnits();
  }

  async loadArchivedUnits() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .select('*, fbus_units!inner(*)')
        .not('deleted_at', 'is', null);

      if (error) throw error;
      this.archivedUnits = data.map((item: any) => ({
        ...item,
        unit: item.fbus_units.units,
        unit_office: item.unit_office
      }));
    } catch (error) {
      console.error('Error fetching archived units:', error);
    }
  }

  showRestoreConfirmation(unit: UnitOffice) {
    this.unitToRestore = unit;
    this.showRestoreModal = true;
  }

  async confirmRestore() {
    if (!this.unitToRestore) return;

    try {
      const { error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .update({ deleted_at: null })
        .eq('id', this.unitToRestore.id);

      if (error) throw error;

      this.showRestoreModal = false;
      this.showSuccess('Unit restored successfully');
      await this.loadUnits();
      await this.loadArchivedUnits();
    } catch (error) {
      console.error('Error restoring unit:', error);
    }
  }
}