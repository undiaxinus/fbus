import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class UserDashboardComponent {
  userStats = {
    activeBonds: 2,
    totalValue: 150000,
    nextExpiry: '2024-04-15',
    daysToExpiry: 30
  };

  recentActivities = [
    {
      action: 'Bond Renewal Request',
      status: 'pending',
      date: '2024-02-20',
      amount: '₱75,000'
    },
    {
      action: 'Bond Coverage Updated',
      status: 'success',
      date: '2024-02-15',
      amount: '₱50,000'
    },
    {
      action: 'New Bond Request',
      status: 'approved',
      date: '2024-02-10',
      amount: '₱25,000'
    }
  ];

  upcomingRenewals = [
    {
      bondId: 'BOND-001',
      amount: '₱50,000',
      expiryDate: '2024-04-15',
      status: 'Active'
    },
    {
      bondId: 'BOND-002',
      amount: '₱75,000',
      expiryDate: '2024-05-20',
      status: 'Active'
    }
  ];

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
      case 'active':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  getDaysLeftColor(days: number): string {
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  }
} 