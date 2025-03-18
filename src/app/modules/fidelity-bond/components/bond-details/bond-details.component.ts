import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BondDetails, BondService } from '../../services/bond.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-bond-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bond-details.component.html',
  styleUrl: './bond-details.component.css',
  animations: [
    trigger('fadeSlide', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(10px)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition(':enter', [
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class BondDetailsComponent implements OnInit {
  bondDetails: BondDetails | null = null;
  loading = false;
  error: string | null = null;
  pageLoading = true;

  constructor(
    private router: Router,
    private bondService: BondService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.bondDetails = navigation.extras.state['bondDetails'];
    }
  }

  ngOnInit(): void {
    if (!this.bondDetails) {
      this.error = 'No bond details available';
    }
    // Simulate page loading for smoother transitions
    setTimeout(() => {
      this.pageLoading = false;
    }, 300);
  }

  backToSearch(): void {
    this.router.navigate(['/bond-lookup']);
  }

  async downloadPDF(): Promise<void> {
    if (!this.bondDetails) return;

    try {
      this.loading = true;
      const pdfBlob = await this.bondService.generatePDF(this.bondDetails);
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bond-details-${this.bondDetails.risk_no}.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.error = 'Failed to generate PDF. Please try again.';
      console.error('PDF generation error:', error);
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        this.error = null;
      }, 5000);
    }
  }

  printDetails(): void {
    window.print();
  }

  // Helper method to determine status color
  getStatusColor(): string {
    if (!this.bondDetails) return 'gray';
    
    const daysRemaining = parseInt(this.bondDetails.days_remaning);
    
    if (daysRemaining > 30) return 'green';
    if (daysRemaining > 0) return 'yellow';
    return 'red';
  }
}
