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
    { label: 'AED - United Arab Emirates Dirham', value: 'AED' },
    { label: 'AFN - Afghani', value: 'AFN' },
    { label: 'ALL - Lek', value: 'ALL' },
    { label: 'AMD - Armenian Dram', value: 'AMD' },
    { label: 'ANG - Netherlands Antillean Guilder', value: 'ANG' },
    { label: 'AOA - Kwanza', value: 'AOA' },
    { label: 'ARS - Argentine Peso', value: 'ARS' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
    { label: 'AWG - Aruban Florin', value: 'AWG' },
    { label: 'AZN - Azerbaijan Manat', value: 'AZN' },
    { label: 'BAM - Convertible Mark', value: 'BAM' },
    { label: 'BBD - Barbados Dollar', value: 'BBD' },
    { label: 'BDT - Taka', value: 'BDT' },
    { label: 'BGN - Bulgarian Lev', value: 'BGN' },
    { label: 'BHD - Bahraini Dinar', value: 'BHD' },
    { label: 'BIF - Burundi Franc', value: 'BIF' },
    { label: 'BMD - Bermudian Dollar', value: 'BMD' },
    { label: 'BND - Brunei Dollar', value: 'BND' },
    { label: 'BOB - Boliviano', value: 'BOB' },
    { label: 'BRL - Brazilian Real', value: 'BRL' },
    { label: 'BSD - Bahamian Dollar', value: 'BSD' },
    { label: 'BTN - Ngultrum', value: 'BTN' },
    { label: 'BWP - Pula', value: 'BWP' },
    { label: 'BYN - Belarusian Ruble', value: 'BYN' },
    { label: 'BZD - Belize Dollar', value: 'BZD' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'CDF - Congolese Franc', value: 'CDF' },
    { label: 'CHF - Swiss Franc', value: 'CHF' },
    { label: 'CLP - Chilean Peso', value: 'CLP' },
    { label: 'CNY - Yuan Renminbi', value: 'CNY' },
    { label: 'COP - Colombian Peso', value: 'COP' },
    { label: 'CRC - Costa Rica Colon', value: 'CRC' },
    { label: 'CUP - Cuban Peso', value: 'CUP' },
    { label: 'CVE - Cape Verde Escudo', value: 'CVE' },
    { label: 'CZK - Czech Koruna', value: 'CZK' },
    { label: 'DJF - Djibouti Franc', value: 'DJF' },
    { label: 'DKK - Danish Krone', value: 'DKK' },
    { label: 'DOP - Dominican Peso', value: 'DOP' },
    { label: 'DZD - Algerian Dinar', value: 'DZD' },
    { label: 'EGP - Egyptian Pound', value: 'EGP' },
    { label: 'ERN - Nakfa', value: 'ERN' },
    { label: 'ETB - Ethiopian Birr', value: 'ETB' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'FJD - Fiji Dollar', value: 'FJD' },
    { label: 'FKP - Falkland Islands Pound', value: 'FKP' },
    { label: 'GBP - Pound Sterling', value: 'GBP' },
    { label: 'GEL - Lari', value: 'GEL' },
    { label: 'GGP - Guernsey Pound', value: 'GGP' },
    { label: 'GHS - Ghana Cedi', value: 'GHS' },
    { label: 'GIP - Gibraltar Pound', value: 'GIP' },
    { label: 'GMD - Dalasi', value: 'GMD' },
    { label: 'GNF - Guinea Franc', value: 'GNF' },
    { label: 'GTQ - Quetzal', value: 'GTQ' },
    { label: 'GYD - Guyana Dollar', value: 'GYD' },
    { label: 'HKD - Hong Kong Dollar', value: 'HKD' },
    { label: 'HNL - Lempira', value: 'HNL' },
    { label: 'HRK - Kuna', value: 'HRK' },
    { label: 'HTG - Gourde', value: 'HTG' },
    { label: 'HUF - Forint', value: 'HUF' },
    { label: 'IDR - Rupiah', value: 'IDR' },
    { label: 'ILS - New Israeli Sheqel', value: 'ILS' },
    { label: 'IMP - Isle of Man Pound', value: 'IMP' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'IQD - Iraqi Dinar', value: 'IQD' },
    { label: 'IRR - Iranian Rial', value: 'IRR' },
    { label: 'ISK - Iceland Krona', value: 'ISK' },
    { label: 'JEP - Jersey Pound', value: 'JEP' },
    { label: 'JMD - Jamaican Dollar', value: 'JMD' },
    { label: 'JOD - Jordanian Dinar', value: 'JOD' },
    { label: 'JPY - Yen', value: 'JPY' },
    { label: 'KES - Kenyan Shilling', value: 'KES' },
    { label: 'KGS - Som', value: 'KGS' },
    { label: 'KHR - Riel', value: 'KHR' },
    { label: 'KMF - Comorian Franc', value: 'KMF' },
    { label: 'KPW - North Korean Won', value: 'KPW' },
    { label: 'KRW - Won', value: 'KRW' },
    { label: 'KWD - Kuwaiti Dinar', value: 'KWD' },
    { label: 'KYD - Cayman Islands Dollar', value: 'KYD' },
    { label: 'KZT - Tenge', value: 'KZT' },
    { label: 'LAK - Kip', value: 'LAK' },
    { label: 'LBP - Lebanese Pound', value: 'LBP' },
    { label: 'LKR - Sri Lanka Rupee', value: 'LKR' },
    { label: 'LRD - Liberian Dollar', value: 'LRD' },
    { label: 'LSL - Loti', value: 'LSL' },
    { label: 'LYD - Libyan Dinar', value: 'LYD' },
    { label: 'MAD - Moroccan Dirham', value: 'MAD' },
    { label: 'MDL - Moldovan Leu', value: 'MDL' },
    { label: 'MGA - Ariary', value: 'MGA' },
    { label: 'MKD - Denar', value: 'MKD' },
    { label: 'MMK - Kyat', value: 'MMK' },
    { label: 'MNT - Tugrik', value: 'MNT' },
    { label: 'MOP - Pataca', value: 'MOP' },
    { label: 'MRU - Ouguiya', value: 'MRU' },
    { label: 'MUR - Mauritius Rupee', value: 'MUR' },
    { label: 'MVR - Rufiyaa', value: 'MVR' },
    { label: 'MWK - Kwacha', value: 'MWK' },
    { label: 'MXN - Mexican Peso', value: 'MXN' },
    { label: 'MYR - Malaysian Ringgit', value: 'MYR' },
    { label: 'MZN - Metical', value: 'MZN' },
    { label: 'NAD - Namibian Dollar', value: 'NAD' },
    { label: 'NGN - Naira', value: 'NGN' },
    { label: 'NIO - Cordoba Oro', value: 'NIO' },
    { label: 'NOK - Norwegian Krone', value: 'NOK' },
    { label: 'NPR - Nepalese Rupee', value: 'NPR' },
    { label: 'NZD - New Zealand Dollar', value: 'NZD' },
    { label: 'OMR - Rial Omani', value: 'OMR' },
    { label: 'PAB - Balboa', value: 'PAB' },
    { label: 'PEN - Sol', value: 'PEN' },
    { label: 'PGK - Kina', value: 'PGK' },
    { label: 'PHP - Philippine Peso', value: 'PHP' },
    { label: 'PKR - Pakistan Rupee', value: 'PKR' },
    { label: 'PLN - Zloty', value: 'PLN' },
    { label: 'PYG - Guarani', value: 'PYG' },
    { label: 'QAR - Qatari Rial', value: 'QAR' },
    { label: 'RON - Romanian Leu', value: 'RON' },
    { label: 'RSD - Serbian Dinar', value: 'RSD' },
    { label: 'RUB - Russian Ruble', value: 'RUB' },
    { label: 'RWF - Rwanda Franc', value: 'RWF' },
    { label: 'SAR - Saudi Riyal', value: 'SAR' },
    { label: 'SBD - Solomon Islands Dollar', value: 'SBD' },
    { label: 'SCR - Seychelles Rupee', value: 'SCR' },
    { label: 'SDG - Sudanese Pound', value: 'SDG' },
    { label: 'SEK - Swedish Krona', value: 'SEK' },
    { label: 'SGD - Singapore Dollar', value: 'SGD' },
    { label: 'SHP - Saint Helena Pound', value: 'SHP' },
    { label: 'SLL - Leone', value: 'SLL' },
    { label: 'SOS - Somali Shilling', value: 'SOS' },
    { label: 'SRD - Surinam Dollar', value: 'SRD' },
    { label: 'SSP - South Sudanese Pound', value: 'SSP' },
    { label: 'STN - Dobra', value: 'STN' },
    { label: 'SVC - El Salvador Colon', value: 'SVC' },
    { label: 'SYP - Syrian Pound', value: 'SYP' },
    { label: 'SZL - Lilangeni', value: 'SZL' },
    { label: 'THB - Baht', value: 'THB' },
    { label: 'TJS - Somoni', value: 'TJS' },
    { label: 'TMT - Manat', value: 'TMT' },
    { label: 'TND - Tunisian Dinar', value: 'TND' },
    { label: 'TOP - Paanga', value: 'TOP' },
    { label: 'TRY - Turkish Lira', value: 'TRY' },
    { label: 'TTD - Trinidad and Tobago Dollar', value: 'TTD' },
    { label: 'TWD - New Taiwan Dollar', value: 'TWD' },
    { label: 'TZS - Tanzanian Shilling', value: 'TZS' },
    { label: 'UAH - Hryvnia', value: 'UAH' },
    { label: 'UGX - Uganda Shilling', value: 'UGX' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'UYU - Peso Uruguayo', value: 'UYU' },
    { label: 'UZS - Uzbekistan Som', value: 'UZS' },
    { label: 'VES - Bolivar', value: 'VES' },
    { label: 'VND - Dong', value: 'VND' },
    { label: 'VUV - Vatu', value: 'VUV' },
    { label: 'WST - Tala', value: 'WST' },
    { label: 'XAF - Central African CFA Franc', value: 'XAF' },
    { label: 'XCD - East Caribbean Dollar', value: 'XCD' },
    { label: 'XDR - IMF Special Drawing Rights', value: 'XDR' },
    { label: 'XOF - West African CFA franc', value: 'XOF' },
    { label: 'XPF - CFP Franc', value: 'XPF' },
    { label: 'YER - Yemeni Rial', value: 'YER' },
    { label: 'ZAR - Rand', value: 'ZAR' },
    { label: 'ZMW - Zambian Kwacha', value: 'ZMW' },
    { label: 'ZWL - Zimbabwe Dollar', value: 'ZWL' }
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