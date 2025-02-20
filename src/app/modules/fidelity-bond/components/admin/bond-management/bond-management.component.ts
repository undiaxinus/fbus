import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bond {
  id: number;
  employeeName: string;
  employeeId: string;
  amount: number;
  startDate: string;
  expiryDate: string;
  status: string;
  department: string;
}

@Component({
  selector: 'app-bond-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bond-management.component.html'
})
export class BondManagementComponent {
  bonds: Bond[] = [
    {
      id: 1,
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      amount: 50000,
      startDate: '2024-01-01',
      expiryDate: '2025-01-01',
      status: 'Active',
      department: 'Finance'
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      employeeId: 'EMP002',
      amount: 75000,
      startDate: '2024-02-01',
      expiryDate: '2025-02-01',
      status: 'Active',
      department: 'Accounting'
    },
    {
      id: 3,
      employeeName: 'Mike Johnson',
      employeeId: 'EMP003',
      amount: 25000,
      startDate: '2023-12-01',
      expiryDate: '2024-03-15',
      status: 'Expiring Soon',
      department: 'Treasury'
    }
  ];

  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedDepartment: string = 'all';
  showAddBondModal: boolean = false;

  departments: string[] = ['Finance', 'Accounting', 'Treasury', 'HR', 'Operations'];
  statuses: string[] = ['Active', 'Expiring Soon', 'Expired', 'Renewed'];

  get filteredBonds(): Bond[] {
    return this.bonds.filter(bond => {
      const matchesSearch = 
        bond.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bond.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || bond.status === this.selectedStatus;
      const matchesDepartment = this.selectedDepartment === 'all' || bond.department === this.selectedDepartment;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'renewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  getDaysUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
