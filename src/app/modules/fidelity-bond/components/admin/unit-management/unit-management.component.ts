import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class UnitManagementComponent {
  units: Unit[] = [
    {
      id: 1,
      name: 'Finance Department',
      code: 'FIN',
      description: 'Handles financial operations and reporting',
      totalEmployees: 25,
      activeBonds: 20,
      status: 'Active',
      head: 'John Smith'
    },
    {
      id: 2,
      name: 'Accounting Department',
      code: 'ACC',
      description: 'Manages accounting and bookkeeping',
      totalEmployees: 30,
      activeBonds: 28,
      status: 'Active',
      head: 'Maria Garcia'
    },
    {
      id: 3,
      name: 'Treasury Department',
      code: 'TRE',
      description: 'Manages cash flow and investments',
      totalEmployees: 15,
      activeBonds: 12,
      status: 'Active',
      head: 'Robert Chen'
    }
  ];

  searchTerm: string = '';
  selectedStatus: string = 'all';
  showAddUnitModal: boolean = false;

  statuses: string[] = ['Active', 'Inactive', 'Under Review'];

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
    return (unit.activeBonds / unit.totalEmployees) * 100;
  }

  deleteUnit(id: number): void {
    this.units = this.units.filter(unit => unit.id !== id);
  }
}
