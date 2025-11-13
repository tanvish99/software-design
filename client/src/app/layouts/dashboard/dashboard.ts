import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeSwitcher } from "src/app/themeswitcher";
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemeSwitcher,
    TableModule
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  
  products!: any[];

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  
  ) {}

  ngOnInit(): void {
    this.products = [
      { id: '1000', name: 'Bamboo Watch', price: 65, category: 'Accessories', quantity: 24 },
      { id: '1001', name: 'Black Watch', price: 72, category: 'Accessories', quantity: 61 },
      { id: '1002', name: 'Blue Band', price: 79, category: 'Fitness', quantity: 2 },
      { id: '1003', name: 'Blue T-Shirt', price: 29, category: 'Clothing', quantity: 25 },
      { id: '1004', name: 'Bracelet', price: 15, category: 'Accessories', quantity: 73 },
      { id: '1005', name: 'Brown Purse', price: 120, category: 'Accessories', quantity: 0 },
      { id: '1006', name: 'Chakra Bracelet', price: 32, category: 'Accessories', quantity: 5 },
      { id: '1007', name: 'Galaxy Earrings', price: 34, category: 'Accessories', quantity: 23 },
      { id: '1008', name: 'Game Controller', price: 99, category: 'Electronics', quantity: 2 }
    ];
  }
}