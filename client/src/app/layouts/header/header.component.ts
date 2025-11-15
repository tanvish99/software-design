import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, AvatarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: '/dashboard'
    },
    {
      label: 'Transactions',
      icon: 'pi pi-wallet',
      routerLink: '/transactions'
    },
    {
      label: 'Budgets',
      icon: 'pi pi-dollar',
      routerLink: '/budgets'
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      routerLink: '/settings'
    }
  ];
}