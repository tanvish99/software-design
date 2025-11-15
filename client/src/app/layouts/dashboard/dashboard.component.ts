import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

import { Transaction } from '../../transactions/transactions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    TagModule,
    TableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  transactions: Transaction[] = [];

  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  pieData: any;
  pieOptions: any;

  barData: any;
  barOptions: any;

  ngOnInit(): void {
    this.loadSampleTransactions();
    this.calculateSummary();
    this.preparePieChart();
    this.prepareBarChart();
  }

  loadSampleTransactions() {
    this.transactions = [
      { id: 1, type: 'INCOME',  category: 'Salary',     amount: 2500, date: new Date(2025,0,31), note: 'Monthly salary' },
      { id: 2, type: 'EXPENSE', category: 'Rent',       amount: 900,  date: new Date(2025,0,1),  note: 'January rent' },
      { id: 3, type: 'EXPENSE', category: 'Food',       amount: 300,  date: new Date(2025,0,14), note: 'Groceries' },
      { id: 4, type: 'EXPENSE', category: 'Transport',  amount: 120,  date: new Date(2025,0,10), note: 'Bus pass' },
      { id: 5, type: 'INCOME',  category: 'Freelance',  amount: 400,  date: new Date(2025,0,15), note: 'Side gig' }
    ];
  }

  calculateSummary() {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = this.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpense;
  }

  preparePieChart() {
    const categories: any = {};
    
    this.transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    this.pieData = {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
        }
      ]
    };

    this.pieOptions = {
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  prepareBarChart() {
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    const incomeData = [1700, 2000, 2200, 2500, 2600, 2500];
    const expenseData = [900, 1100, 1000, 1200, 1300, 1320];

    this.barData = {
      labels: months,
      datasets: [
        { label: 'Income',  data: incomeData },
        { label: 'Expenses', data: expenseData }
      ]
    };

    this.barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  getSeverity(type: 'INCOME' | 'EXPENSE') {
    return type === 'INCOME' ? 'success' : 'danger';
  }
}