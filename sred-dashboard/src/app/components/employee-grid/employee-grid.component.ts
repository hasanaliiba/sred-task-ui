import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Employee } from '../../models';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import { PaginatorComponent } from '../paginator/paginator.component';

/**
 * Employee salary grid + CRUD (Req 3, Feature C). Lists employees with the derived
 * hourly rate, supports add / edit / remove via a modal form, and paginates the
 * table client-side (~10/page). Salary/rate are not period-dependent.
 */
@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, EmployeeFormComponent, EmployeeDetailComponent, PaginatorComponent],
  templateUrl: './employee-grid.component.html',
})
export class EmployeeGridComponent {
  private readonly data = inject(DashboardDataService);

  readonly teams$ = this.data.teams$;
  readonly pageSize = 10;
  private readonly page$ = new BehaviorSubject<number>(1);

  /** Paged view: clamps the page to the current row count and slices the rows. */
  readonly vm$ = combineLatest([this.data.employees$, this.page$]).pipe(
    map(([rows, page]) => {
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / this.pageSize));
      const current = Math.min(page, pages);
      const start = (current - 1) * this.pageSize;
      return { rows: rows.slice(start, start + this.pageSize), total, page: current, pageSize: this.pageSize };
    }),
  );

  setPage(page: number): void {
    this.page$.next(page);
  }

  /** Form modal state: closed (null), or open editing an employee / adding (null employee). */
  formOpen = false;
  editing: Employee | null = null;

  /** Delete confirmation state. */
  pendingDelete: Employee | null = null;

  /** Detail modal: id of the employee being inspected (null = closed). */
  detailId: string | null = null;

  openDetail(id: string): void {
    this.detailId = id;
  }

  closeDetail(): void {
    this.detailId = null;
  }

  openAdd(): void {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(employee: Employee): void {
    this.editing = employee;
    this.formOpen = true;
  }

  onSave(employee: Employee): void {
    if (this.editing) {
      this.data.updateEmployee(employee);
    } else {
      this.data.addEmployee(employee);
    }
    this.closeForm();
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
  }

  askDelete(employee: Employee): void {
    this.pendingDelete = employee;
  }

  confirmDelete(): void {
    if (this.pendingDelete) {
      this.data.removeEmployee(this.pendingDelete.id);
    }
    this.pendingDelete = null;
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }
}
