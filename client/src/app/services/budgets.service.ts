import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

export interface BudgetDTO {
  id: number;
  category: string;
  amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetDTO {
  category: string;
  amount: number;
  period: string;   // we will use MONTHLY for now
}

export interface UpdateBudgetDTO {
  category?: string;
  amount?: number;
  period?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetsService {
    private apiService = inject(ApiService);

    private API_URL = `${environment.apiUrl}/budgets/`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<BudgetDTO[]> {
        const headers = this.apiService.buildHeaders();
        return this.http.get<BudgetDTO[]>(this.API_URL, { headers });
    }

    create(data: CreateBudgetDTO): Observable<BudgetDTO> {
        const headers = this.apiService.buildHeaders();
        return this.http.post<BudgetDTO>(this.API_URL, data, { headers });
    }

    update(id: number, data: UpdateBudgetDTO): Observable<BudgetDTO> {
        const headers = this.apiService.buildHeaders();
        return this.http.put<BudgetDTO>(`${this.API_URL}${id}`, data, { headers });
    }

    delete(id: number): Observable<void> {
        const headers = this.apiService.buildHeaders();
        return this.http.delete<void>(`${this.API_URL}${id}`, { headers });
    }

    getSpentTotals() {
        const headers = this.apiService.buildHeaders();
        return this.http.get<{ [category: string]: number }>(`${this.API_URL}spent`, { headers });
    }
}