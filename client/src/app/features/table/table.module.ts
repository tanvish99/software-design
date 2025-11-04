import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from 'primeng/table';

import { TableComponent } from './table.component';

const routes: Routes = [
  { path: '', component: TableComponent }
];

@NgModule({
  declarations: [TableComponent],
  imports: [CommonModule, TableModule, RouterModule.forChild(routes)]
})
export class TableFeatureModule {}
