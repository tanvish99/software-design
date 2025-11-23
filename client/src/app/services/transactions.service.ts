import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface TransactionDTO {
  id: number;
  user_id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: Date;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionDTO {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;   // backend expects ISO string (YYYY-MM-DD)
  note?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  private API_URL = `${environment.apiUrl}/transactions/`;

  getAll(): Observable<TransactionDTO[]> {
    const headers = this.apiService.buildHeaders();
    return this.http.get<TransactionDTO[]>(this.API_URL, { headers });
  }

  create(data: CreateTransactionDTO): Observable<TransactionDTO> {
    const headers = this.apiService.buildHeaders();
    return this.http.post<TransactionDTO>(this.API_URL, data, { headers });
  }

  update(id: number, data: Partial<CreateTransactionDTO>): Observable<TransactionDTO> {
    const headers = this.apiService.buildHeaders();
    return this.http.put<TransactionDTO>(`${this.API_URL}${id}`, data, { headers });
  }

  delete(id: number): Observable<void> {
    const headers = this.apiService.buildHeaders();
    return this.http.delete<void>(`${this.API_URL}${id}`, { headers });
  }
}