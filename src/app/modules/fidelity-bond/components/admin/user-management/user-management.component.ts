import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  lastLogin: string;
}

interface NewUser {
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent {
  users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      department: 'Finance',
      status: 'Active',
      lastLogin: '2024-02-20 09:30 AM'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      department: 'Accounting',
      status: 'Active',
      lastLogin: '2024-02-20 10:15 AM'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'User',
      department: 'Treasury',
      status: 'Inactive',
      lastLogin: '2024-02-19 03:45 PM'
    }
  ];

  searchTerm: string = '';
  selectedRole: string = 'all';
  selectedStatus: string = 'all';

  roles: string[] = ['Admin', 'User', 'Manager'];
  statuses: string[] = ['Active', 'Inactive', 'Suspended'];
  departments: string[] = ['Finance', 'Accounting', 'Treasury', 'HR', 'Operations'];

  showAddUserModal: boolean = false;
  newUser: NewUser = {
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'Active'
  };

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  addUser(): void {
    const id = this.users.length + 1;
    const newUser: User = {
      id,
      ...this.newUser,
      lastLogin: 'Never'
    };
    this.users.push(newUser);
    this.showAddUserModal = false;
    this.resetNewUser();
  }

  resetNewUser(): void {
    this.newUser = {
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'Active'
    };
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
  }
}
