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
import { BudgetsService } from '../services/budgets.service';

export interface Budget {
  id: number;
  category: string;
  amount: number;
  spent: number;   // calculated locally
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
    private budgetsService: BudgetsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBudgets();
  }

  initForm(): void {
    this.budgetForm = this.fb.group({
      category: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]]
    });
  }

  // -------------------------------------------
  // LOAD FROM BACKEND
  // -------------------------------------------
  loadBudgets() {
  this.budgetsService.getAll().subscribe({
    next: (budgetList) => {
      // Step 1: convert budgets
      const mapped = budgetList.map(b => ({
        id: b.id,
        category: b.category,
        amount: b.amount,
        spent: 0
      }));

      // Step 2: fetch spent totals
      this.budgetsService.getSpentTotals().subscribe({
        next: (spentMap) => {
          this.budgets = mapped.map(b => ({
            ...b,
            spent: spentMap[b.category] ?? 0
          }));
        },
        error: () => {
          this.budgets = mapped; // fallback
        }
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load budgets'
      });
    }
  });
}

  // -------------------------------------------
  // CREATE / EDIT
  // -------------------------------------------
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
      // UPDATE
      this.budgetsService.update(this.editingBudget.id, {
        category: formValue.category,
        amount: formValue.amount
      }).subscribe({
        next: (updated) => {
          this.loadBudgets();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Budget updated.' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not update budget.' });
        }
      });

    } else {
      // CREATE
      this.budgetsService.create({
        category: formValue.category,
        amount: formValue.amount,
        period: "MONTHLY"
      }).subscribe({
        next: () => {
          this.loadBudgets();
          this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Budget added.' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not add budget.' });
        }
      });
    }

    this.dialogVisible = false;
  }

  // -------------------------------------------
  // DELETE
  // -------------------------------------------
  confirmDelete(budget: Budget) {
    this.confirmationService.confirm({
      message: `Delete this budget?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteBudget(budget)
    });
  }

  deleteBudget(budget: Budget) {
    this.budgetsService.delete(budget.id).subscribe({
      next: () => {
        this.loadBudgets();
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Budget removed.' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not delete budget.' });
      }
    });
  }

  // -------------------------------------------
  // UTILITIES
  // -------------------------------------------
  // returns integer % already (your existing getPercentage should round)
getPercentage(budget: Budget): number {
  const percent = (budget.spent / budget.amount) * 100;
  return Math.min(Math.round(percent), 100);
}

/**
 * Return a CSS color string for the progress bar.
 * Uses theme-friendly hex values but you can replace with CSS variables like 'var(--p-green-500)' if your theme defines them.
 */
getProgressColor(budget: Budget): string {
  const percent = this.getPercentage(budget);

  if (percent < 60) {
    // green
    return '#16a34a'; // Tailwind green-600 / good visual contrast
    // OR use theme CSS var if available: return 'var(--p-green-500)';
  }
  if (percent < 90) {
    // amber / yellow
    return '#f59e0b'; // Tailwind amber-500
    // OR: return 'var(--p-yellow-500)';
  }
  // 90+ -> red
  return '#ef4444'; // Tailwind red-500
  // OR: return 'var(--p-red-500)';
}

}