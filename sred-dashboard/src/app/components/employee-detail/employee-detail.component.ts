import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Observable, of } from 'rxjs';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { EmployeeDetail } from '../../models';

/**
 * Read-only per-employee SR&ED breakdown modal (Feature C, screenshot pg. 5).
 * Shows hours per project split SR&ED vs Unclaimed, plus SR&ED hours, total hours,
 * and SR&ED allocation %. Reactive to the selected period.
 */
@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, PercentPipe],
  templateUrl: './employee-detail.component.html',
})
export class EmployeeDetailComponent implements OnInit {
  @Input() employeeId: string | null = null;
  @Output() close = new EventEmitter<void>();

  private readonly data = inject(DashboardDataService);
  detail$: Observable<EmployeeDetail | null> = of(null);

  ngOnInit(): void {
    if (this.employeeId) {
      this.detail$ = this.data.employeeDetailFull$(this.employeeId);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  /** Width % of a part of total hours, guarding divide-by-zero. */
  widthPct(part: number, total: number): number {
    return total > 0 ? (part / total) * 100 : 0;
  }
}
