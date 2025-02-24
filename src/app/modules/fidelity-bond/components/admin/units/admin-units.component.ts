import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { UnitOffice } from '../../../../../models/unit-office.model';
import { inject } from '@angular/core';

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
  showNewUnitModal = false;
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

  newUnitData = {
    units: ''
  };

  showNewDesignationModal = false;
  newDesignation = {
    designation: ''
  };

  designations: any[] = [];
  filteredDesignations: any[] = [];
  designationFilterText: string = '';
  designationToDelete: any = null;
  designationToRestore: any = null;

  private supabase = inject(SupabaseService);

  // Add this property to your component class
  archivedUnitsCount: number = 0;

  // Add these properties at the top of your component class
  showDeleteDesignationModal = false;
  showRestoreDesignationModal = false;
  showArchivedDesignationsModal = false;
  archivedDesignations: any[] = [];
  archivedDesignationsCount: number = 0;

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  async ngOnInit() {
    await this.loadUnits();
    await this.loadAvailableUnits();
    await this.loadArchivedUnitsCount();
    await this.loadDesignations();
    await this.loadArchivedDesignationsCount();
  }

  async loadAvailableUnits() {
    try {
      const { data, error } = await this.supabase.client
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
      const { data, error } = await this.supabase.client
        .from('fbus_units')
        .select('*')
        .is('deleted_at', null);

      if (error) throw error;
      this.units = data.map((item: any) => ({
        ...item,
        units: item.units
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
        unit.units.toLowerCase().includes(searchText)
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
      const { data: unitData, error: unitError } = await this.supabase.client
        .from('fbus_units')
        .insert([{
          units: this.newUnit.unit.trim()
        }])
        .select();

      if (unitError) throw unitError;

      // Then create the unit office with the reference to the unit
      const { data, error } = await this.supabase.client
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
        // Log the activity in fbus_activities
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Added new unit office: ${this.newUnit.unit_office.trim()} under ${this.newUnit.unit}`,
            user_name: await this.getCurrentUserName(),
            created_at: new Date().toISOString()
          }]);

        if (activityError) throw activityError;

        await this.loadUnits();
        this.newUnit = { unit: '', unit_office: '' };
        this.showModal = false;
        this.showSuccess('Unit office added successfully!');
      } else {
        console.error('No data returned after insert');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      this.showError('Failed to add unit office');
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
        const { error } = await this.supabase.client
          .from('fbus_units')
          .update({ deleted_at: timestamp })
          .eq('id', this.unitToDelete.id)
          .is('deleted_at', null);

        if (error) throw error;

        // Log the activity
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Archived unit: ${this.unitToDelete.units}`,
            user_name: await this.getCurrentUserName(),
            created_at: timestamp
          }]);

        if (activityError) throw activityError;

        await this.loadUnits();
        this.showDeleteModal = false;
        this.unitToDelete = null;
        this.showSuccess('Unit archived successfully!');
        await this.loadArchivedUnitsCount();
      } catch (error) {
        console.error('Error archiving unit:', error);
        this.showError('Failed to archive unit');
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
    await this.loadArchivedUnitsCount();
  }

  async loadArchivedUnits() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_units')
        .select('*')
        .not('deleted_at', 'is', null);

      if (error) throw error;
      this.archivedUnits = data.map((item: any) => ({
        ...item,
        units: item.units
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
    try {
      if (!this.unitToRestore) {
        console.error('No unit selected for restore');
        return;
      }

      // Restore the unit by setting deleted_at to null
      const { data, error } = await this.supabase.client
        .from('fbus_units')
        .update({ deleted_at: null })
        .eq('id', this.unitToRestore.id)
        .select();

      if (error) throw error;

      if (data) {
        // Log the activity in fbus_activities
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Restored unit: ${this.unitToRestore.units}`,
            user_name: await this.getCurrentUserName(),
            created_at: new Date().toISOString()
          }]);

        if (activityError) throw activityError;

        // Reset and refresh
        this.showRestoreModal = false;
        this.unitToRestore = null;
        await this.loadUnits();
        await this.loadArchivedUnits();
        await this.loadArchivedUnitsCount();
        this.showSuccess('Unit restored successfully');
      }
    } catch (error) {
      console.error('Error restoring unit:', error);
      this.showError('Failed to restore unit');
    }
  }

  async addNewUnit() {
    try {
      if (!this.newUnitData.units.trim()) {
        console.error('Unit name is required');
        return;
      }

      const { data, error } = await this.supabase.client
        .from('fbus_units')
        .insert([{
          units: this.newUnitData.units.trim()
        }])
        .select();

      if (error) throw error;

      if (data) {
        // Log the activity in fbus_activities
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Added new unit: ${this.newUnitData.units.trim()}`,
            user_name: await this.getCurrentUserName(),
            created_at: new Date().toISOString()
          }]);

        if (activityError) throw activityError;

        await this.loadAvailableUnits(); // Refresh the units list
        this.newUnitData.units = ''; // Reset the form
        this.showNewUnitModal = false;
        this.showSuccess('Unit added successfully!');
      }
    } catch (error) {
      console.error('Error adding new unit:', error);
      this.showError('Failed to add unit');
    }
  }

  async addNewDesignation() {
    try {
      // First insert the new designation
      const { data, error } = await this.supabase.client
        .from('fbus_designation')
        .insert([
          { designation: this.newDesignation.designation }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Log the activity in fbus_activities with correct schema
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Added new designation: ${this.newDesignation.designation}`,
            user_name: await this.getCurrentUserName(),
            created_at: new Date().toISOString()
          }]);

        if (activityError) throw activityError;

        // Reset form and close modal
        this.newDesignation = { designation: '' };
        this.showNewDesignationModal = false;
        await this.loadDesignations();
        this.showSuccess('Designation added successfully');
      }
    } catch (error) {
      console.error('Error adding designation:', error);
      this.showError('Failed to add designation');
    }
  }

  // Add this method for error messages
  private showError(message: string) {
    alert(message); // You can enhance this later with a proper error notification system
  }

  // Helper method to get current user's name
  private async getCurrentUserName(): Promise<string> {
    try {
      const { data: sessionData, error: sessionError } = await this.supabase.client
        .from('users')
        .select('name')
        .limit(1)  // Add limit to get only one user
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

  async loadDesignations() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_designation')
        .select('*')
        .is('deleted_at', null)
        .order('designation', { ascending: true });

      if (error) throw error;

      if (data) {
        this.designations = data;
        this.filteredDesignations = [...data];
      }
    } catch (error) {
      console.error('Error loading designations:', error);
    }
  }

  // Add this method to fetch the count
  async loadArchivedUnitsCount() {
    try {
      const { count, error } = await this.supabase.client
        .from('fbus_units')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

      if (error) throw error;
      this.archivedUnitsCount = count || 0;
    } catch (error) {
      console.error('Error fetching archived units count:', error);
      this.archivedUnitsCount = 0;
    }
  }

  onDesignationFilter() {
    if (this.designationFilterText) {
      const searchText = this.designationFilterText.toLowerCase();
      this.filteredDesignations = this.designations.filter(designation =>
        designation.designation.toLowerCase().includes(searchText)
      );
    } else {
      this.filteredDesignations = [...this.designations];
    }
  }

  async showDeleteDesignationConfirmation(designation: any) {
    this.designationToDelete = designation;
    this.showDeleteDesignationModal = true;
  }

  async confirmDeleteDesignation() {
    if (this.designationToDelete) {
      try {
        const timestamp = new Date().toISOString();
        const { error } = await this.supabase.client
          .from('fbus_designation')
          .update({ deleted_at: timestamp })
          .eq('id', this.designationToDelete.id)
          .is('deleted_at', null);

        if (error) throw error;

        // Log the activity
        const { error: activityError } = await this.supabase.client
          .from('fbus_activities')
          .insert([{
            action: `Archived designation: ${this.designationToDelete.designation}`,
            user_name: await this.getCurrentUserName(),
            created_at: timestamp
          }]);

        if (activityError) throw activityError;

        await this.loadDesignations();
        this.showDeleteDesignationModal = false;
        this.designationToDelete = null;
        this.showSuccess('Designation archived successfully!');
      } catch (error) {
        console.error('Error archiving designation:', error);
        this.showError('Failed to archive designation');
      }
    }
  }

  // Add this method to show archived designations
  async showArchivedDesignations() {
    this.showArchivedDesignationsModal = true;
    await this.loadArchivedDesignations();
    await this.loadArchivedDesignationsCount();
  }

  // Add method to load archived designations
  async loadArchivedDesignations() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_designation')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('designation', { ascending: true });

      if (error) throw error;
      this.archivedDesignations = data || [];
    } catch (error) {
      console.error('Error fetching archived designations:', error);
      this.archivedDesignations = [];
    }
  }

  // Add method to get archived designations count
  async loadArchivedDesignationsCount() {
    try {
      const { count, error } = await this.supabase.client
        .from('fbus_designation')
        .select('*', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

      if (error) throw error;
      this.archivedDesignationsCount = count || 0;
    } catch (error) {
      console.error('Error fetching archived designations count:', error);
      this.archivedDesignationsCount = 0;
    }
  }

  // Update the restore confirmation method
  showRestoreDesignationConfirmation(designation: any) {
    this.designationToRestore = designation;
    this.showRestoreDesignationModal = true;
  }

  // Update the restore confirmation method
  async confirmRestoreDesignation() {
    try {
      if (!this.designationToRestore) {
        console.error('No designation selected for restore');
        return;
      }

      const { error } = await this.supabase.client
        .from('fbus_designation')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', this.designationToRestore.id);

      if (error) throw error;

      // Log the activity
      const { error: activityError } = await this.supabase.client
        .from('fbus_activities')
        .insert([{
          action: `Restored designation: ${this.designationToRestore.designation}`,
          user_name: await this.getCurrentUserName(),
          created_at: new Date().toISOString()
        }]);

      if (activityError) throw activityError;

      // Reset and refresh
      this.showRestoreDesignationModal = false;
      this.designationToRestore = null;
      await this.loadDesignations();
      await this.loadArchivedDesignations();
      await this.loadArchivedDesignationsCount();
      this.showSuccess('Designation restored successfully');
    } catch (error) {
      console.error('Error restoring designation:', error);
      this.showError('Failed to restore designation');
    }
  }

}