import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

    private api = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient, private apiService: ApiService) {}

    getSummary(): Observable<any> {
        const headers = this.apiService.buildHeaders();
        return this.http.get(`${this.api}/summary`, { headers });
    }

    getRecentTransactions(limit: number = 5): Observable<any[]> {
        const headers = this.apiService.buildHeaders();
        return this.http.get<any[]>(`${this.api}/recent?limit=${limit}`, { headers });
    }

    getCategoryExpense(): Observable<any> {
        const headers = this.apiService.buildHeaders();
        return this.http.get(`${this.api}/category-expense`, { headers });
    }

    getMonthlyTrend(months = 6): Observable<any> {
        const headers = this.apiService.buildHeaders();
        return this.http.get(`${this.api}/monthly-trend?months=${months}`, { headers });
    }
}