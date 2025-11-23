import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';
import { TransactionsService, TransactionDTO } from '../services/transactions.service';

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
    SelectModule,
    InputNumberModule,
    DatePickerModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TransactionsComponent implements OnInit {

  transactions: TransactionDTO[] = [];
  transactionForm!: FormGroup;

  dialogVisible = false;
  dialogTitle = 'Add Transaction';
  editingTransaction: TransactionDTO | null = null;

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
    private transactionService: TransactionsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTransactionsFromServer();
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

  // 🚀 Load from Backend
  loadTransactionsFromServer(): void {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data.map(t => ({
          ...t,
          date: this.fixLocalDate(t.date as unknown as string)
        }));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load transactions' });
      }
    });
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

  openEditDialog(transaction: TransactionDTO): void {
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

    const form = this.transactionForm.value;

    const payload = {
      type: form.type,
      category: form.category,
      amount: form.amount,
      date: form.date.toISOString().split('T')[0],  // YYYY-MM-DD
      note: form.note
    };

    if (this.editingTransaction) {
      // UPDATE
      this.transactionService.update(this.editingTransaction.id, payload).subscribe({
        next: (updated) => {
          this.loadTransactionsFromServer();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Transaction updated successfully' });
          this.dialogVisible = false;
        }
      });
    } else {
      // CREATE
      this.transactionService.create(payload).subscribe({
        next: () => {
          this.loadTransactionsFromServer();
          this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Transaction added successfully' });
          this.dialogVisible = false;
        }
      });
    }
  }

  confirmDelete(transaction: TransactionDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this transaction?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTransaction(transaction);
      }
    });
  }

  deleteTransaction(transaction: TransactionDTO): void {
    this.transactionService.delete(transaction.id).subscribe({
      next: () => {
        this.loadTransactionsFromServer();
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Transaction deleted successfully' });
      }
    });
  }

  getTypeSeverity(type: 'INCOME' | 'EXPENSE'): string {
    return type === 'INCOME' ? 'success' : 'danger';
  }

  fixLocalDate(dateString: string): Date {
  const parts = dateString.split('-'); // ["2025","01","15"]
  // month is 0-based in JS
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}
}