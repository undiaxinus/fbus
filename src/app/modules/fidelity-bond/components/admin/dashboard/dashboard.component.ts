import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class AdminDashboardComponent {
  stats = {
    totalBonds: 2547,
    activeBonds: 2100,
    expiringBonds: 150,
    expiredBonds: 297
  };

  recentActivities = [
    {
      action: 'New bond created',
      user: 'John Doe',
      time: '2 hours ago',
      status: 'success',
      amount: '₱50,000'
    },
    {
      action: 'Bond renewed',
      user: 'Jane Smith',
      time: '4 hours ago',
      status: 'info',
      amount: '₱75,000'
    },
    {
      action: 'Bond expired',
      user: 'Mike Johnson',
      time: '6 hours ago',
      status: 'danger',
      amount: '₱25,000'
    }
  ];

  upcomingExpirations = [
    {
      employee: 'Sarah Wilson',
      position: 'Financial Analyst',
      expiryDate: '2024-03-15',
      amount: '₱100,000',
      daysLeft: 5
    },
    {
      employee: 'Robert Chen',
      position: 'Senior Accountant',
      expiryDate: '2024-03-20',
      amount: '₱150,000',
      daysLeft: 10
    },
    {
      employee: 'Maria Garcia',
      position: 'Treasury Manager',
      expiryDate: '2024-03-25',
      amount: '₱200,000',
      daysLeft: 15
    }
  ];

  bondDistribution = {
    labels: ['Active', 'Expiring Soon', 'Expired'],
    data: [70, 20, 10]
  };

  constructor() {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'danger':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }

  getDaysLeftColor(days: number): string {
    if (days <= 7) return 'text-red-500';
    if (days <= 14) return 'text-yellow-500';
    return 'text-green-500';
  }
}
