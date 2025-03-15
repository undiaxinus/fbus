import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsHistoryService, SmsHistory } from '../../../../../core/services/sms-history.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-notifications.component.html'
})
export class AdminNotificationsComponent implements OnInit {
  smsHistory: SmsHistory[] = [];
  displayedAlerts: SmsHistory[] = [];
  initialDisplayCount = 10;
  showAll = false;

  constructor(private smsHistoryService: SmsHistoryService) {}

  ngOnInit() {
    this.smsHistoryService.getSmsHistory().subscribe({
      next: (data) => {
        this.smsHistory = data;
        this.updateDisplayedAlerts();
      },
      error: (error) => {
        console.error('Error fetching SMS history:', error);
      }
    });
  }

  viewAll() {
    this.showAll = true;
    this.updateDisplayedAlerts();
  }

  showLess() {
    this.showAll = false;
    this.updateDisplayedAlerts();
  }

  private updateDisplayedAlerts() {
    this.displayedAlerts = this.showAll 
      ? this.smsHistory 
      : this.smsHistory.slice(0, this.initialDisplayCount);
  }
} 