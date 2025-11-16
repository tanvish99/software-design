import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ThemeSwitcher } from '../themeswitcher'; // 👈 adjust path

interface AppSettings {
  currency: string;
  dateFormat: string;
  monthStartDay: number;
  dashboardRange: 'THIS_MONTH' | 'LAST_30_DAYS' | 'THIS_YEAR';
  showTips: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // PrimeNG
    CardModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule,

    // Theme switcher component
    ThemeSwitcher
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [MessageService]
})
export class SettingsComponent implements OnInit {
  private readonly STORAGE_KEY = 'financeTrackerSettings';

  settingsForm!: FormGroup;

  currencyOptions = [
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'EUR - Euro', value: 'EUR' }
  ];

  dateFormatOptions = [
    { label: 'YYYY-MM-DD (2025-11-16)', value: 'yyyy-MM-dd' },
    { label: 'DD/MM/YYYY (16/11/2025)', value: 'dd/MM/yyyy' },
    { label: 'MM/DD/YYYY (11/16/2025)', value: 'MM/dd/yyyy' }
  ];

  dashboardRangeOptions = [
    { label: 'This Month', value: 'THIS_MONTH' },
    { label: 'Last 30 Days', value: 'LAST_30_DAYS' },
    { label: 'This Year', value: 'THIS_YEAR' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const stored = this.loadSettings();

    this.settingsForm = this.fb.group({
      currency: [stored.currency, Validators.required],
      dateFormat: [stored.dateFormat, Validators.required],
      monthStartDay: [
        stored.monthStartDay,
        [Validators.required, Validators.min(1), Validators.max(28)]
      ],
      dashboardRange: [stored.dashboardRange, Validators.required],
      showTips: [stored.showTips]
    });
  }

  loadSettings(): AppSettings {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AppSettings;
      } catch {
        // fall back to defaults if parsing fails
      }
    }

    // Defaults
    return {
      currency: 'CAD',
      dateFormat: 'yyyy-MM-dd',
      monthStartDay: 1,
      dashboardRange: 'THIS_MONTH',
      showTips: true
    };
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const value: AppSettings = this.settingsForm.value;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));

    this.messageService.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: 'Your preferences have been updated.'
    });
  }
}