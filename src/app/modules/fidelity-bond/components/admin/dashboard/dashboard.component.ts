import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { inject } from '@angular/core';

interface Bond {
  id: number;
  effective_date: string;
  date_of_cancellation: string;
  is_archived: boolean;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  unit_office?: string;
  risk_no?: string;
  rank?: string;
  amount_of_bond?: number;
}

interface DashboardStats {
  totalBonds: number;
  activeBonds: number;
  expiringBonds: number;
  expiredBonds: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  private supabase = inject(SupabaseService);
  
  stats: DashboardStats = {
    totalBonds: 0,
    activeBonds: 0,
    expiringBonds: 0,
    expiredBonds: 0
  };

  activeRate: string = '0.0%';

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

  upcomingExpirations: any[] = [];

  bondDistribution = {
    labels: ['Active', 'Expiring Soon', 'Expired'],
    data: [70, 20, 10]
  };

  showExpiringModal = false;
  allExpiringBonds: any[] = [];

  ngOnInit() {
    this.loadStats();
    this.loadUpcomingExpirations();
  }

  async loadStats() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_list')
        .select('*');

      if (error) throw error;

      if (data) {
        // Only count non-archived bonds
        const activeBonds = (data as Bond[]).filter((bond: Bond) => !bond.is_archived);
        
        // Calculate stats based on bond status
        this.stats = {
          totalBonds: activeBonds.length,
          activeBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'VALID').length,
          expiringBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRE SOON').length,
          expiredBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRED').length
        };

        // Calculate active rate percentage
        const activeRate = (this.stats.activeBonds / this.stats.totalBonds * 100).toFixed(1);
        this.activeRate = `${activeRate}%`;
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  async loadUpcomingExpirations() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_list')
        .select('*')
        .eq('is_archived', false);

      if (error) throw error;

      if (data) {
        const today = new Date();
        const bonds = data as Bond[];
        
        // Filter and map bonds that are expiring soon
        this.upcomingExpirations = bonds
          .filter(bond => {
            if (!bond.date_of_cancellation) return false;
            
            const cancellationDate = new Date(bond.date_of_cancellation);
            const effectiveDate = new Date(bond.effective_date);
            const daysLeft = Math.ceil((cancellationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Only include bonds that are:
            // 1. Currently active (today is after effective date)
            // 2. Not yet expired (today is before cancellation date)
            // 3. Expiring within 14 days
            return today >= effectiveDate && 
                   today <= cancellationDate && 
                   daysLeft > 0 && 
                   daysLeft <= 14;
          })
          .map(bond => {
            const cancellationDate = new Date(bond.date_of_cancellation);
            const daysLeft = Math.ceil((cancellationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            // Format the employee name
            const fullName = [
              bond.first_name || '',
              bond.middle_name ? bond.middle_name.charAt(0) + '.' : '',
              bond.last_name || ''
            ].filter(Boolean).join(' ');

            return {
              employee: fullName,
              position: bond.rank || 'N/A',
              expiryDate: bond.date_of_cancellation,
              amount: this.formatAmount(bond.amount_of_bond || 0),
              daysLeft: daysLeft
            };
          })
          .sort((a, b) => a.daysLeft - b.daysLeft) // Sort by days left (ascending)
          .slice(0, 5); // Limit to 5 entries
      }
    } catch (error) {
      console.error('Error loading upcoming expirations:', error);
    }
  }

  formatAmount(amount: number): string {
    return `₱${amount.toLocaleString()}`;
  }

  calculateBondStatus(bond: Bond): string {
    if (!bond.effective_date || !bond.date_of_cancellation) return 'EXPIRED';
    
    const today = new Date();
    const effectiveDate = new Date(bond.effective_date);
    const cancellationDate = new Date(bond.date_of_cancellation);
    
    // Check if the bond is within its valid period
    if (today >= effectiveDate && today <= cancellationDate) {
      // Calculate days until expiry
      const daysUntilExpiry = Math.ceil((cancellationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0) return 'EXPIRED';
      if (daysUntilExpiry <= 14) return 'EXPIRE SOON';
      return 'VALID';
    }
    
    return 'EXPIRED';
  }

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

  async loadAllExpiringBonds() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_list')
        .select('*')
        .eq('is_archived', false)
        .order('date_of_cancellation', { ascending: true }); // Order by expiration date

      if (error) throw error;

      if (data) {
        const today = new Date();
        this.allExpiringBonds = (data as Bond[])
          .filter(bond => {
            if (!bond.date_of_cancellation) return false;
            
            const cancellationDate = new Date(bond.date_of_cancellation);
            const effectiveDate = new Date(bond.effective_date);
            
            // Include all future expirations (today or later)
            return today >= effectiveDate && 
                   today <= cancellationDate;
          })
          .map(bond => {
            const cancellationDate = new Date(bond.date_of_cancellation);
            const daysLeft = Math.ceil((cancellationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            const fullName = [
              bond.first_name || '',
              bond.middle_name ? bond.middle_name.charAt(0) + '.' : '',
              bond.last_name || ''
            ].filter(Boolean).join(' ');

            return {
              employee: fullName,
              position: bond.rank || 'N/A',
              expiryDate: new Date(bond.date_of_cancellation).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              amount: this.formatAmount(bond.amount_of_bond || 0),
              daysLeft: daysLeft,
              unit_office: bond.unit_office || 'N/A'
            };
          })
          .sort((a, b) => a.daysLeft - b.daysLeft); // Sort by closest to expiration
      }
    } catch (error) {
      console.error('Error loading all expiring bonds:', error);
    }
  }

  openExpiringModal() {
    this.loadAllExpiringBonds();
    this.showExpiringModal = true;
  }

  closeExpiringModal() {
    this.showExpiringModal = false;
  }
}
