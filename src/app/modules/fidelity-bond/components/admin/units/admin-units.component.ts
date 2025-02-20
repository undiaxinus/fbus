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
  units: UnitOffice[] = [];
  filteredUnits: UnitOffice[] = [];
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
  }

  async loadUnits() {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .select('*')
        .is('deleted_at', null);

      if (error) throw error;
      this.units = data;
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

      const { data, error } = await this.supabaseService.getClient()
        .from('fbus_unit_office')
        .insert([{
          unit: this.newUnit.unit.trim(),
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
        const { error } = await this.supabaseService.getClient()
          .from('fbus_unit_office')
          .update({ deleted_at: new Date().toISOString() })
          .eq('unit', this.unitToDelete.unit);

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
}