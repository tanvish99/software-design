import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: false
})
export class TableComponent implements OnInit {
  items: Array<{ name: string; value: number }> = [];

  ngOnInit(): void {
    // sample data for the table
    this.items = [
      { name: 'Alpha', value: 10 },
      { name: 'Bravo', value: 20 },
      { name: 'Charlie', value: 30 }
    ];
  }
}
