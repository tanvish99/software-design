import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';

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
  providers: [MessageService, DashboardService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Summary values
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  // Charts
  pieData: any;
  pieOptions: any;

  barData: any;
  barOptions: any;

  // Recent transactions
  transactions: any[] = [];

  loading = true;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadDashboardData();
  }

  // ------------------------------------
  // Load Dashboard Data
  // ------------------------------------
  loadDashboardData() {
    this.loading = true;

    Promise.all([
      this.dashboardService.getSummary().toPromise(),
      this.dashboardService.getRecentTransactions().toPromise(),
      this.dashboardService.getCategoryExpense().toPromise(),
      this.dashboardService.getMonthlyTrend().toPromise()
    ])
      .then(([summary, recent, catExpense, trend]) => {
        
        // Summary
        this.totalIncome = summary.total_income;
        this.totalExpense = summary.total_expense;
        this.balance = summary.balance;

        // Recent
        this.transactions = recent.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));

        // Charts
        this.preparePieChart(catExpense);
        this.prepareBarChart(trend);

      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load dashboard data.'
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // ------------------------------------
  // Pie Chart (Expenses by Category)
  // ------------------------------------
  preparePieChart(categoryData: any) {
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);

    this.pieData = {
      labels,
      datasets: [
        {
          data: values
        }
      ]
    };
  }

  // ------------------------------------
  // Bar Chart (Monthly Trend)
  // ------------------------------------
  prepareBarChart(trend: any) {
    this.barData = {
      labels: trend.labels,
      datasets: [
        {
          label: 'Income',
          data: trend.income
        },
        {
          label: 'Expenses',
          data: trend.expense
        }
      ]
    };
  }

  // ------------------------------------
  // Chart Options (UI only)
  // ------------------------------------
  initChartOptions() {
    this.pieOptions = {
      plugins: {
        legend: { position: 'bottom' }
      },
      maintainAspectRatio: false,
      responsive: true
    };

    this.barOptions = {
      plugins: {
        legend: { position: 'bottom' }
      },
      maintainAspectRatio: false,
      responsive: true
    };
  }

  // UI helper for tags
  getSeverity(type: 'INCOME' | 'EXPENSE') {
    return type === 'INCOME' ? 'success' : 'danger';
  }
}