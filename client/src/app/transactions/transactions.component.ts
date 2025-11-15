import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';          // ✅ instead of DropdownModule
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';  // ✅ instead of CalendarModule
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: Date;
  note?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,        // ✅
    InputNumberModule,
    DatePickerModule,    // ✅
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TransactionsComponent implements OnInit {

  transactions: Transaction[] = [];
  transactionForm!: FormGroup;

  dialogVisible = false;
  dialogTitle = 'Add Transaction';
  editingTransaction: Transaction | null = null;

  typeOptions = [
    { label: 'Income', value: 'INCOME' },
    { label: 'Expense', value: 'EXPENSE' }
  ];

  categoryOptions = [
    { label: 'Salary', value: 'Salary' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Food', value: 'Food' },
    { label: 'Rent', value: 'Rent' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Bills & Utilities', value: 'Bills & Utilities' },
    { label: 'Others', value: 'Others' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSampleData();
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      type: ['EXPENSE', Validators.required],
      category: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      note: ['']
    });
  }

  loadSampleData(): void {
    this.transactions = [
      {
        id: 1,
        type: 'INCOME',
        category: 'Salary',
        amount: 2500,
        date: new Date(2025, 0, 31),
        note: 'Monthly salary'
      },
      {
        id: 2,
        type: 'EXPENSE',
        category: 'Rent',
        amount: 900,
        date: new Date(2025, 0, 1),
        note: 'January rent'
      },
      {
        id: 3,
        type: 'EXPENSE',
        category: 'Food',
        amount: 120.5,
        date: new Date(2025, 0, 5),
        note: 'Groceries & eating out'
      },
      {
        id: 4,
        type: 'EXPENSE',
        category: 'Transport',
        amount: 60,
        date: new Date(2025, 0, 7),
        note: 'Bus pass'
      },
      {
        id: 5,
        type: 'INCOME',
        category: 'Freelance',
        amount: 300,
        date: new Date(2025, 0, 15),
        note: 'Side project'
      }
    ];
  }

  openAddDialog(): void {
    this.dialogTitle = 'Add Transaction';
    this.editingTransaction = null;
    this.transactionForm.reset({
      type: 'EXPENSE',
      category: null,
      amount: null,
      date: new Date(),
      note: ''
    });
    this.dialogVisible = true;
  }

  openEditDialog(transaction: Transaction): void {
    this.dialogTitle = 'Edit Transaction';
    this.editingTransaction = transaction;
    this.transactionForm.setValue({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: new Date(transaction.date),
      note: transaction.note ?? ''
    });
    this.dialogVisible = true;
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.value;

    if (this.editingTransaction) {
      const index = this.transactions.findIndex(t => t.id === this.editingTransaction!.id);
      if (index !== -1) {
        this.transactions[index] = {
          ...this.transactions[index],
          ...formValue
        };
      }
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Transaction updated successfully' });
    } else {
      const newTransaction: Transaction = {
        id: this.getNextId(),
        type: formValue.type,
        category: formValue.category,
        amount: formValue.amount,
        date: formValue.date,
        note: formValue.note
      };
      this.transactions = [...this.transactions, newTransaction];
      this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Transaction added successfully' });
    }

    this.dialogVisible = false;
  }

  getNextId(): number {
    if (this.transactions.length === 0) return 1;
    return Math.max(...this.transactions.map(t => t.id)) + 1;
  }

  confirmDelete(transaction: Transaction): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this transaction?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTransaction(transaction);
      }
    });
  }

  deleteTransaction(transaction: Transaction): void {
    this.transactions = this.transactions.filter(t => t.id !== transaction.id);
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Transaction deleted successfully' });
  }

  getTypeSeverity(type: 'INCOME' | 'EXPENSE'): string {
    return type === 'INCOME' ? 'success' : 'danger';
  }
}