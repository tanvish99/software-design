import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ExchangeRates {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly STORAGE_KEY = 'financeTrackerSettings';
  private readonly RATES_STORAGE_KEY = 'exchangeRates';
  private readonly RATES_TIMESTAMP_KEY = 'exchangeRatesTimestamp';
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  
  private baseCurrency = 'USD'; // Base currency for exchange rates
  private currentCurrency$ = new BehaviorSubject<string>('USD');
  private exchangeRates$ = new BehaviorSubject<ExchangeRates>({});

  constructor(private http: HttpClient) {
    this.loadCurrencyFromSettings();
    this.loadExchangeRates();
  }

  /**
   * Load the user's selected currency from settings
   */
  private loadCurrencyFromSettings(): void {
    const settingsStr = localStorage.getItem(this.STORAGE_KEY);
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.currency) {
          let currency = settings.currency;
          
          // Handle case where currency might be stored as an object
          if (typeof currency === 'object' && currency !== null) {
            currency = currency.value || 'USD';
          }
          
          this.currentCurrency$.next(currency);
        }
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }

  /**
   * Get the current selected currency as an observable
   */
  getCurrentCurrency(): Observable<string> {
    return this.currentCurrency$.asObservable();
  }

  /**
   * Get the current selected currency value
   */
  getCurrentCurrencyValue(): string {
    return this.currentCurrency$.value;
  }

  /**
   * Update the current currency
   */
  setCurrency(currency: string): void {
    this.currentCurrency$.next(currency);
    this.loadExchangeRates();
  }

  /**
   * Get exchange rates as an observable
   */
  getExchangeRates(): Observable<ExchangeRates> {
    return this.exchangeRates$.asObservable();
  }

  /**
   * Load exchange rates from API or cache
   */
  private loadExchangeRates(): void {
    // Check if we have cached rates
    const cachedRates = localStorage.getItem(this.RATES_STORAGE_KEY);
    const timestamp = localStorage.getItem(this.RATES_TIMESTAMP_KEY);
    
    if (cachedRates && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < this.CACHE_DURATION) {
        // Use cached rates
        try {
          const rates = JSON.parse(cachedRates);
          this.exchangeRates$.next(rates);
          return;
        } catch (e) {
          console.error('Failed to parse cached rates', e);
        }
      }
    }

    // Fetch fresh rates from API
    this.fetchExchangeRates();
  }

  /**
   * Fetch exchange rates from a free API
   * Using exchangerate-api.com (free tier: 1500 requests/month)
   */
  private fetchExchangeRates(): void {
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`;
    
    this.http.get<any>(apiUrl).pipe(
      map(response => response.rates as ExchangeRates),
      catchError(error => {
        console.error('Failed to fetch exchange rates', error);
        // Return a default set of rates with USD as 1
        return [{ USD: 1 } as ExchangeRates];
      })
    ).subscribe(rates => {
      this.exchangeRates$.next(rates);
      
      // Cache the rates
      localStorage.setItem(this.RATES_STORAGE_KEY, JSON.stringify(rates));
      localStorage.setItem(this.RATES_TIMESTAMP_KEY, Date.now().toString());
    });
  }

  /**
   * Convert an amount from base currency (USD) to target currency
   * All amounts in database are stored in USD
   */
  convert(amount: number, targetCurrency?: string): number {
    if (!targetCurrency) {
      targetCurrency = this.currentCurrency$.value;
    }

    const rates = this.exchangeRates$.value;
    
    // If no rates loaded yet or target is USD, return as is
    if (Object.keys(rates).length === 0 || targetCurrency === this.baseCurrency) {
      return amount;
    }

    const rate = rates[targetCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${targetCurrency}`);
      return amount;
    }

    return amount * rate;
  }

  /**
   * Convert an amount from any currency back to base currency (USD)
   * Used when saving to database
   */
  convertToBase(amount: number, fromCurrency: string): number {
    if (fromCurrency === this.baseCurrency) {
      return amount;
    }

    const rates = this.exchangeRates$.value;
    const rate = rates[fromCurrency];
    
    if (!rate || rate === 0) {
      console.warn(`Exchange rate not found for ${fromCurrency}`);
      return amount;
    }

    return amount / rate;
  }

  /**
   * Get currency symbol for display
   */
  getCurrencySymbol(currencyCode: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
      'INR': '₹', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'CHF', 'SEK': 'kr',
      'NZD': 'NZ$', 'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr',
      'MXN': 'Mex$', 'ZAR': 'R', 'BRL': 'R$', 'RUB': '₽', 'TRY': '₺',
      'AED': 'د.إ', 'SAR': '﷼', 'THB': '฿', 'PLN': 'zł', 'IDR': 'Rp',
      'MYR': 'RM', 'PHP': '₱', 'DKK': 'kr', 'CZK': 'Kč', 'ILS': '₪',
      'CLP': 'CLP$', 'PKR': '₨', 'EGP': 'E£', 'VND': '₫'
    };

    return symbols[currencyCode] || currencyCode + ' ';
  }

  /**
   * Refresh exchange rates manually
   */
  refreshRates(): Observable<ExchangeRates> {
    this.fetchExchangeRates();
    return this.exchangeRates$.asObservable();
  }
}
