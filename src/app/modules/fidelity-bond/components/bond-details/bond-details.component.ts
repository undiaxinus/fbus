import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BondService } from '../../services/bond.service';
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
  bondDetails: any = null;
  loading = false;
  error: string | null = null;
  pageLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bondService: BondService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No bond ID provided';
      this.pageLoading = false;
      return;
    }

    // Load bond details using the ID
    this.loading = true;
    this.bondService.getBondById(id).subscribe({
      next: (details) => {
        this.bondDetails = details;
        this.loading = false;
        this.pageLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load bond details';
        this.loading = false;
        this.pageLoading = false;
        console.error('Error loading bond details:', error);
      }
    });
  }

  backToSearch(): void {
    this.router.navigate(['/fidelity-bond/bond-lookup']);
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
      link.download = `bond-${this.bondDetails.risk_no}.pdf`;
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
