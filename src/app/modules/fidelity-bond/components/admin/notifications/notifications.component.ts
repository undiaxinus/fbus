import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  notifications: Notification[] = [
    {
      id: 1,
      title: 'Bond Expiring Soon',
      message: 'The fidelity bond for John Doe will expire in 30 days.',
      type: 'warning',
      timestamp: '2024-02-20 09:30 AM',
      isRead: false,
      actionRequired: true
    },
    {
      id: 2,
      title: 'New Bond Request',
      message: 'Jane Smith has requested a new fidelity bond.',
      type: 'info',
      timestamp: '2024-02-20 10:15 AM',
      isRead: false,
      actionRequired: true
    },
    {
      id: 3,
      title: 'Bond Renewed',
      message: 'The fidelity bond for Mike Johnson has been successfully renewed.',
      type: 'success',
      timestamp: '2024-02-19 03:45 PM',
      isRead: true,
      actionRequired: false
    }
  ];

  selectedFilter: string = 'all';
  searchTerm: string = '';

  filters: string[] = ['all', 'unread', 'action required'];

  get filteredNotifications(): Notification[] {
    return this.notifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      switch (this.selectedFilter) {
        case 'unread':
          return !notification.isRead && matchesSearch;
        case 'action required':
          return notification.actionRequired && matchesSearch;
        default:
          return matchesSearch;
      }
    });
  }

  getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
}
