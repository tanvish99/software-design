import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

export interface Budget {
  id: number;
  category: string;
  amount: number;
  spent: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BudgetsComponent implements OnInit {

  budgets: Budget[] = [];
  budgetForm!: FormGroup;

  dialogVisible = false;
  dialogTitle = 'Add Budget';
  editingBudget: Budget | null = null;

  categoryOptions = [
    { label: 'Food', value: 'Food' },
    { label: 'Rent', value: 'Rent' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills & Utilities', value: 'Bills & Utilities' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Others', value: 'Others' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSampleBudgets();
  }

  initForm(): void {
    this.budgetForm = this.fb.group({
      category: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadSampleBudgets() {
    this.budgets = [
      { id: 1, category: 'Food', amount: 400, spent: 250 },
      { id: 2, category: 'Rent', amount: 900, spent: 900 },
      { id: 3, category: 'Transport', amount: 150, spent: 90 },
      { id: 4, category: 'Entertainment', amount: 100, spent: 45 }
    ];
  }

  openAddDialog() {
    this.dialogTitle = 'Add Budget';
    this.editingBudget = null;

    this.budgetForm.reset({
      category: null,
      amount: null
    });

    this.dialogVisible = true;
  }

  openEditDialog(budget: Budget) {
    this.dialogTitle = 'Edit Budget';
    this.editingBudget = budget;

    this.budgetForm.setValue({
      category: budget.category,
      amount: budget.amount
    });

    this.dialogVisible = true;
  }

  saveBudget() {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const formValue = this.budgetForm.value;

    if (this.editingBudget) {
      const index = this.budgets.findIndex(b => b.id === this.editingBudget!.id);
      if (index !== -1) {
        this.budgets[index] = {
          ...this.budgets[index],
          ...formValue
        };
      }

      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Budget updated successfully.' });

    } else {
      const newBudget: Budget = {
        id: this.getNextId(),
        category: formValue.category,
        amount: formValue.amount,
        spent: 0
      };
      this.budgets = [...this.budgets, newBudget];

      this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Budget added successfully.' });
    }

    this.dialogVisible = false;
  }

  getNextId() {
    if (this.budgets.length === 0) return 1;
    return Math.max(...this.budgets.map(b => b.id)) + 1;
  }

  confirmDelete(budget: Budget) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this budget?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteBudget(budget)
    });
  }

  deleteBudget(budget: Budget) {
    this.budgets = this.budgets.filter(b => b.id !== budget.id);
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Budget deleted successfully.' });
  }

  getPercentage(budget: Budget) {
    return Math.min((budget.spent / budget.amount) * 100, 100);
  }

  getProgressSeverity(budget: Budget) {
    const percent = this.getPercentage(budget);

    if (percent < 60) return 'success';
    if (percent < 90) return 'warning';
    return 'danger';
  }

}