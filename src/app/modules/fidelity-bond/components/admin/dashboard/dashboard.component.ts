import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { inject } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../../shared/shared.module';

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
  supplyBonds: number;
  proCpoPmbBonds: number;
  rsuBonds: number;
  rhqBonds: number;
}

interface DepartmentStats {
  name: string;
  totalBonds: number;
  activeBonds: number;
  expiringBonds: number;
  expiredBonds: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedModule]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private supabase = inject(SupabaseService);
  
  @ViewChild('distributionChart') distributionChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  
  private distributionChart?: Chart;
  private trendChart?: Chart;
  today: Date = new Date();
  isDepartmentStatsVisible: boolean = false;

  stats: DashboardStats = {
    totalBonds: 0,
    activeBonds: 0,
    expiringBonds: 0,
    expiredBonds: 0,
    supplyBonds: 0,
    proCpoPmbBonds: 0,
    rsuBonds: 0,
    rhqBonds: 0
  };

  departmentStats: DepartmentStats[] = [];

  activeRate: string = '0.0%';
  recentActivities: any[] = [];
  upcomingExpirations: any[] = [];
  showExpiringModal = false;
  allExpiringBonds: any[] = [];
  showActivitiesModal = false;
  allActivities: any[] = [];

  ngOnInit() {
    this.loadStats();
    this.loadUpcomingExpirations();
    this.loadRecentActivities();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  private initializeCharts() {
    // Initialize Distribution Chart
    const distributionCtx = this.distributionChartRef.nativeElement.getContext('2d');
    this.distributionChart = new Chart(distributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Expiring Soon', 'Expired'],
        datasets: [{
          data: [this.stats.activeBonds, this.stats.expiringBonds, this.stats.expiredBonds],
          backgroundColor: ['#3B82F6', '#10B981', '#EF4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // Initialize Trend Chart
    const trendCtx = this.trendChartRef.nativeElement.getContext('2d');
    this.trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Bond Trends',
          data: [150, 180, 220, 250, 280, 300],
          borderColor: '#3B82F6',
          tension: 0.4,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private updateCharts() {
    if (this.distributionChart) {
      this.distributionChart.data.datasets[0].data = [
        this.stats.activeBonds,
        this.stats.expiringBonds,
        this.stats.expiredBonds
      ];
      this.distributionChart.update();
    }

    if (this.trendChart) {
      const monthlyData = this.calculateMonthlyBondTrends(this.allExpiringBonds.map(bond => ({
        effective_date: bond.expiryDate,
        date_of_cancellation: bond.expiryDate,
        is_archived: false,
        id: 0
      })));
      
      this.trendChart.data.labels = monthlyData.map(d => d.name);
      this.trendChart.data.datasets[0].data = monthlyData.map(d => d.value);
      this.trendChart.update();
    }
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
        
        // Calculate stats based on bond status and department
        this.stats = {
          totalBonds: activeBonds.length,
          activeBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'VALID').length,
          expiringBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRE SOON').length,
          expiredBonds: activeBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRED').length,
          supplyBonds: activeBonds.filter(bond => bond.unit_office?.toLowerCase().includes('supply')).length,
          proCpoPmbBonds: activeBonds.filter(bond => {
            const office = bond.unit_office?.toLowerCase() || '';
            return office.includes('ppo') || office.includes('cpo') || office.includes('rmfb');
          }).length,
          rsuBonds: activeBonds.filter(bond => bond.unit_office?.toLowerCase().includes('rsu')).length,
          rhqBonds: activeBonds.filter(bond => bond.unit_office?.toLowerCase().includes('rhq')).length
        };

        // Calculate active rate percentage
        const activeRate = (this.stats.activeBonds / this.stats.totalBonds * 100).toFixed(1);
        this.activeRate = `${activeRate}%`;

        // Calculate department-wise statistics
        const departments = new Set(activeBonds.map(bond => bond.unit_office || 'Unassigned'));
        this.departmentStats = Array.from(departments).map(department => {
          const departmentBonds = activeBonds.filter(bond => (bond.unit_office || 'Unassigned') === department);
          return {
            name: department,
            totalBonds: departmentBonds.length,
            activeBonds: departmentBonds.filter(bond => this.calculateBondStatus(bond) === 'VALID').length,
            expiringBonds: departmentBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRE SOON').length,
            expiredBonds: departmentBonds.filter(bond => this.calculateBondStatus(bond) === 'EXPIRED').length
          };
        });

        // Update the charts with new data
        this.updateCharts();
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  calculateMonthlyBondTrends(bonds: Bond[]): { name: string; value: number }[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyTrends: { name: string; value: number }[] = [];

    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const monthBonds = bonds.filter(bond => {
        const bondDate = new Date(bond.effective_date);
        return bondDate.getMonth() === monthIndex;
      });

      monthlyTrends.push({
        name: monthName,
        value: monthBonds.length
      });
    }

    return monthlyTrends;
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

  async loadRecentActivities() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3); // Get only the 3 most recent activities

      if (error) throw error;

      if (data) {
        this.recentActivities = data.map(activity => ({
          action: activity.action,
          user: activity.user_name,
          time: this.formatTimeAgo(new Date(activity.created_at)),
          status: this.getActivityStatus(activity.action),
          amount: this.formatAmount(activity.amount || 0)
        }));
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
      // Set default activities in case of error
      this.recentActivities = [];
    }
  }

  getActivityStatus(action: string): string {
    // Define status based on action type
    switch (action.toLowerCase()) {
      case 'new bond created':
        return 'success';
      case 'bond renewed':
        return 'info';
      case 'bond expired':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString('en-PH');
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

  async loadAllActivities() {
    try {
      const { data, error } = await this.supabase.client
        .from('fbus_activities')  // Assuming you have an activities table
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        this.allActivities = data.map(activity => ({
          action: activity.action,
          user: activity.user_name,
          time: this.formatTimeAgo(new Date(activity.created_at)),
          status: activity.status,
          amount: this.formatAmount(activity.amount || 0)
        }));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  openActivitiesModal() {
    this.loadAllActivities();
    this.showActivitiesModal = true;
  }

  closeActivitiesModal() {
    this.showActivitiesModal = false;
  }

  getDepartmentStats(department: string): DepartmentStats {
    const defaultStats: DepartmentStats = {
      name: department,
      totalBonds: 0,
      activeBonds: 0,
      expiringBonds: 0,
      expiredBonds: 0
    };

    const stats = this.departmentStats.find(d => d.name.toLowerCase().includes(department.toLowerCase()));
    return stats || defaultStats;
  }

  getPpoCpoRmfbStats(): DepartmentStats {
    const defaultStats: DepartmentStats = {
      name: 'PPO/CPO/RMFB',
      totalBonds: 0,
      activeBonds: 0,
      expiringBonds: 0,
      expiredBonds: 0
    };

    const stats = this.departmentStats.find(d => {
      const name = d.name.toLowerCase();
      return name.includes('ppo') || name.includes('cpo') || name.includes('rmfb');
    });
    return stats || defaultStats;
  }
}
