import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from "../header/header";
import { Dashboard } from "../dashboard/dashboard";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, Header, RouterOutlet, Dashboard],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  
  constructor(private router: Router) {
  }
}
