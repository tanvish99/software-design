import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    TagModule,
    TableModule,
    ButtonModule
  ],
  providers: [MessageService, DashboardService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('pieChartContainer') pieChartContainer!: ElementRef;
  @ViewChild('barChartContainer') barChartContainer!: ElementRef;

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

  // ------------------------------------
  // Export Dashboard as PDF
  // ------------------------------------
  exportToPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Finance Tracker Dashboard', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated: ${today}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Income: $${this.totalIncome.toFixed(2)}`, 14, yPosition);
    yPosition += 8;
    doc.text(`Total Expenses: $${this.totalExpense.toFixed(2)}`, 14, yPosition);
    yPosition += 8;
    doc.text(`Balance: $${this.balance.toFixed(2)}`, 14, yPosition);
    yPosition += 15;
    
    // Expense Breakdown - Pie Chart
    if (this.pieChartContainer) {
      const pieCanvas = this.pieChartContainer.nativeElement.querySelector('canvas');
      if (pieCanvas) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Expense Breakdown', 14, yPosition);
        yPosition += 5;
        
        const pieImageData = pieCanvas.toDataURL('image/png');
        const chartWidth = 80;
        const chartHeight = 60;
        const xPos = (pageWidth - chartWidth) / 2;
        doc.addImage(pieImageData, 'PNG', xPos, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 10;
      }
    }
    
    // Expense Breakdown Table (from Pie Chart data)
    if (this.pieData && this.pieData.labels && this.pieData.labels.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Breakdown Details', 14, yPosition);
      yPosition += 5;
      
      const categoryData = this.pieData.labels.map((label: string, index: number) => [
        label,
        `$${this.pieData.datasets[0].data[index].toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Amount']],
        body: categoryData,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 'auto', halign: 'right' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Check if we need a new page before bar chart
    if (yPosition > pageHeight - 90) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Income vs Expenses - Bar Chart
    if (this.barChartContainer) {
      const barCanvas = this.barChartContainer.nativeElement.querySelector('canvas');
      if (barCanvas) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Income vs Expenses (6 months)', 14, yPosition);
        yPosition += 5;
        
        const barImageData = barCanvas.toDataURL('image/png');
        const chartWidth = 160;
        const chartHeight = 80;
        const xPos = (pageWidth - chartWidth) / 2;
        doc.addImage(barImageData, 'PNG', xPos, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 10;
      }
    }
    
    // Monthly Trend Table (from Bar Chart data)
    if (this.barData && this.barData.labels && this.barData.labels.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Trend Details', 14, yPosition);
      yPosition += 5;
      
      const trendData = this.barData.labels.map((label: string, index: number) => [
        label,
        `$${this.barData.datasets[0].data[index].toFixed(2)}`,
        `$${this.barData.datasets[1].data[index].toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Month', 'Income', 'Expenses']],
        body: trendData,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 'auto', halign: 'right' },
          2: { cellWidth: 'auto', halign: 'right' }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Recent Transactions Table
    if (this.transactions && this.transactions.length > 0) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Transactions', 14, yPosition);
      yPosition += 5;
      
      const tableData = this.transactions.map(t => [
        t.type,
        t.category,
        `$${t.amount.toFixed(2)}`,
        new Date(t.date).toLocaleDateString('en-US'),
        t.note || '-'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Category', 'Amount', 'Date', 'Note']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 30 },
          4: { cellWidth: 'auto' }
        }
      });
    }
    
    // Save the PDF
    doc.save(`dashboard_${new Date().getTime()}.pdf`);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Dashboard exported as PDF successfully!'
    });
  }
}