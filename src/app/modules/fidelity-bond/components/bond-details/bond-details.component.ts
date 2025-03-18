import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BondDetails, BondService } from '../../services/bond.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bond-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bond-details.component.html',
  styleUrl: './bond-details.component.css'
})
export class BondDetailsComponent implements OnInit {
  bondDetails: BondDetails | null = null;
  loading = false;
  error: string | null = null;

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
      link.download = `bond-details-${this.bondDetails.id}.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.error = 'Failed to generate PDF. Please try again.';
      console.error('PDF generation error:', error);
    }
  }

  printDetails(): void {
    window.print();
  }
}
