import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'dynamicCurrency',
  standalone: true,
  pure: false // Make it impure so it updates when currency changes
})
export class DynamicCurrencyPipe implements PipeTransform {
  
  constructor(private currencyService: CurrencyService) {}

  transform(value: number | null | undefined, currencyCode?: string): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    // Get the target currency
    const targetCurrency = currencyCode || this.currencyService.getCurrentCurrencyValue();
    
    // Convert the amount
    const convertedAmount = this.currencyService.convert(value, targetCurrency);
    
    // Get the currency symbol
    const symbol = this.currencyService.getCurrencySymbol(targetCurrency);
    
    // Format the number with 2 decimal places
    const formatted = convertedAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `${symbol}${formatted}`;
  }
}
