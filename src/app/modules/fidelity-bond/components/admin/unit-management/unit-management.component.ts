import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitOfficeService, UnitOffice } from '../../../../../services/unit-office.service';

interface Unit {
  id: number;
  name: string;
  code: string;
  description: string;
  totalEmployees: number;
  activeBonds: number;
  status: string;
  head: string;
}

@Component({
  selector: 'app-unit-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-management.component.html'
})
export class UnitManagementComponent implements OnInit {
  units: Unit[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  showAddUnitModal: boolean = false;
  statuses: string[] = ['Active', 'Inactive', 'Under Review'];
  constructor(private unitOfficeService: UnitOfficeService) {}
  ngOnInit() {
    this.loadUnitOffices();
  }
  loadUnitOffices() {
    this.unitOfficeService.getUnitOffices().subscribe({
      next: (unitOffices: UnitOffice[]) => {
        this.units = unitOffices.map(office => ({
          id: office.id,
          name: office.unit,
          code: office.unit_office,
          description: `${office.unit} - ${office.unit_office}`,
          totalEmployees: 0,
          activeBonds: 0,
          status: 'Active',
          head: ''
        }));
      },
      error: (error) => {
        console.error('Error loading unit offices:', error);
      }
    });
  }
  get filteredUnits(): Unit[] {
    return this.units.filter(unit => {
      const matchesSearch = 
        unit.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        unit.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        unit.head.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || unit.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  getBondCoveragePercentage(unit: Unit): number {
    return unit.totalEmployees > 0 ? (unit.activeBonds / unit.totalEmployees) * 100 : 0;
  }
  deleteUnit(id: number): void {
    this.unitOfficeService.deleteUnitOffice(id).then(() => {
      this.units = this.units.filter(unit => unit.id !== id);
    }).catch(error => {
      console.error('Error deleting unit:', error);
    });
  }
}
