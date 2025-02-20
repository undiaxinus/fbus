import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent]
})
export class UserLayoutComponent {} 