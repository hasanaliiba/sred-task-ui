import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Employee } from '../../models';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';

/**
 * Employee salary grid + CRUD (Req 3, Feature C). Lists employees with the derived
 * hourly rate, and supports add / edit / remove via a modal form. Salary/rate are
 * not period-dependent, so the grid itself doesn't react to the period selector.
 */
@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, EmployeeFormComponent, EmployeeDetailComponent],
  templateUrl: './employee-grid.component.html',
})
export class EmployeeGridComponent {
  private readonly data = inject(DashboardDataService);

  readonly employees$ = this.data.employees$;
  readonly teams$ = this.data.teams$;

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
