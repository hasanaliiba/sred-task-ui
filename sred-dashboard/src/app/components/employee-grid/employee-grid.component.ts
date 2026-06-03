import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Employee } from '../../models';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { RowActionsComponent } from '../row-actions/row-actions.component';

/**
 * Employee salary grid + CRUD (Req 3, Feature C). Lists employees with the derived
 * hourly rate and full-year SR&ED hours, supports add / edit / remove via a modal
 * form, and paginates the table client-side (~10/page). Salary/rate aren't period-dependent.
 */
@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    EmployeeFormComponent,
    EmployeeDetailComponent,
    PaginatorComponent,
    AvatarComponent,
    RowActionsComponent,
  ],
  templateUrl: './employee-grid.component.html',
})
export class EmployeeGridComponent {
  private readonly data = inject(DashboardDataService);

  readonly teams$ = this.data.teams$;
  readonly pageSize = 10;
  private readonly page$ = new BehaviorSubject<number>(1);
  private readonly search$ = new BehaviorSubject<string>('');

  /** Paged view: joins FY SR&ED hours per employee, filters by name/province, clamps + slices. */
  readonly vm$ = combineLatest([
    this.data.employees$,
    this.data.employeeHoursBreakdownFull$,
    this.search$,
    this.page$,
  ]).pipe(
    map(([rows, hours, search, page]) => {
      const byId = new Map(hours.map((h) => [h.id, h]));
      const withHours = rows.map((r) => ({
        ...r,
        sredHours: byId.get(r.employee.id)?.sredHours ?? 0,
        totalHours: byId.get(r.employee.id)?.totalHours ?? 0,
      }));
      const q = search.trim().toLowerCase();
      const filtered = q
        ? withHours.filter(
            (r) => r.employee.name.toLowerCase().includes(q) || r.employee.province.toLowerCase().includes(q),
          )
        : withHours;
      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / this.pageSize));
      const current = Math.min(page, pages);
      const start = (current - 1) * this.pageSize;
      return { rows: filtered.slice(start, start + this.pageSize), total, page: current, pageSize: this.pageSize };
    }),
  );

  setPage(page: number): void {
    this.page$.next(page);
  }

  /** New search resets to page 1 so results aren't hidden on a stale page. */
  setSearch(query: string): void {
    this.search$.next(query);
    this.page$.next(1);
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
