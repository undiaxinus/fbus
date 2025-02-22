import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  showAddUserModal = false;
  newUser: any = {
    name: '',
    username: '',
    password: '',
    role: 'fbus_user',
    system_role: 'fidelity-bond'
  };
  showEditModal = false;
  editingUser: User = {
    id: '',
    name: '',
    username: '',
    password: '',
    role: 'fbus_user',
    system_role: 'fidelity-bond'
  };
  showPasswordFields = false;
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      const users = await this.userService.getUsers().toPromise();
      if (users) {
        this.users = users.filter(user => user.system_role === 'fidelity-bond');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Failed to load users');
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method to show success message
  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000); // Hide after 3 seconds
  }

  // Helper method to show error message
  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000); // Hide after 3 seconds
  }

  async addUser() {
    this.isLoading = true;
    try {
      const result = await this.userService.createUser(this.newUser);
      if (result) {
        this.showAddUserModal = false;
        await this.loadUsers();
        this.resetNewUser();
        this.showSuccess('User created successfully');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      this.showError('Failed to create user');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      try {
        const success = await this.userService.deleteUser(id);
        if (success) {
          await this.loadUsers();
          this.showSuccess('User deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showError('Failed to delete user');
      } finally {
        this.isLoading = false;
      }
    }
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  togglePasswordChange() {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordError = '';
    }
  }

  async updateUser() {
    this.isLoading = true;
    try {
      const { id } = this.editingUser;
      const updates: any = {
        name: this.editingUser.name,
        username: this.editingUser.username,
        role: this.editingUser.role,
        system_role: this.editingUser.system_role
      };

      if (this.showPasswordFields) {
        if (!this.newPassword || !this.confirmPassword) {
          this.passwordError = 'Please fill in both password fields';
          this.isLoading = false;
          return;
        }
        if (this.newPassword !== this.confirmPassword) {
          this.passwordError = 'Passwords do not match';
          this.isLoading = false;
          return;
        }
        if (this.newPassword.length < 6) {
          this.passwordError = 'Password must be at least 6 characters long';
          this.isLoading = false;
          return;
        }
        updates.password = this.newPassword;
      }

      const success = await this.userService.updateUser(id, updates);
      if (success) {
        this.showEditModal = false;
        await this.loadUsers();
        this.resetPasswordFields();
        this.showSuccess('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      this.showError('Failed to update user');
    } finally {
      this.isLoading = false;
    }
  }

  private resetNewUser() {
    this.newUser = {
      name: '',
      username: '',
      password: '',
      role: 'fbus_user',
      system_role: 'fidelity-bond'
    };
  }

  private resetPasswordFields() {
    this.showPasswordFields = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  getRoleClass(role: string): string {
    return role === 'fbus_admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-green-100 text-green-800';
  }

  get filteredUsers() {
    return this.users.filter(user => {
      const searchStr = this.searchTerm.toLowerCase();
      return user.name.toLowerCase().includes(searchStr) ||
             user.username.toLowerCase().includes(searchStr) ||
             user.role.toLowerCase().includes(searchStr);
    });
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    const end = this.startIndex + this.itemsPerPage;
    return Math.min(end, this.filteredUsers.length);
  }

  get paginatedUsers() {
    return this.filteredUsers.slice(this.startIndex, this.endIndex);
  }

  onSearch() {
    this.currentPage = 1; // Reset to first page when searching
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
} 