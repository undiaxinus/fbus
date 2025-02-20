import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-bonds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bonds.component.html'
})
export class AdminBondsComponent {
  bonds = [
    {
      unit: '$',
      rank: 1,
      bondId: 'FB-2024-001',
      employee: 'John Doe',
      position: 'Financial Analyst',
      amount: 100000,
      status: 'active',
      expiryDate: '2024-12-31'
    },
    {
      unit: '$',
      rank: 2,
      bondId: 'FB-2024-002',
      employee: 'Jane Smith',
      position: 'Treasury Manager',
      amount: 150000,
      status: 'expiring',
      expiryDate: '2024-04-15'
    },
    {
      unit: '$',
      rank: 3,
      bondId: 'FB-2024-003',
      employee: 'Mike Johnson',
      position: 'Accountant',
      amount: 75000,
      status: 'expired',
      expiryDate: '2024-02-28'
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDaysRemaining(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}