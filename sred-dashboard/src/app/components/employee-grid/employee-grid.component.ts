import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';

/**
 * Employee salary grid (Req 3). Lists every employee with their team, province,
 * dates, expected & confirmed salary, the DERIVED hourly rate, and a
 * specified-employee badge. Salary/rate are not period-dependent, so this grid
 * does not react to the period selector (the hours charts do).
 */
@Component({
  selector: 'app-employee-grid',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './employee-grid.component.html',
})
export class EmployeeGridComponent {
  private readonly data = inject(DashboardDataService);
  readonly employees$ = this.data.employees$;
}
