import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Period } from '../../models';
import { monthsOf } from '../../core/derivations';

interface MonthOption {
  value: number; // 1..12
  label: string;
}

interface RangeVm {
  from: number;
  to: number;
  isCustom: boolean;
}

const MONTHS: MonthOption[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((label, i) => ({ value: i + 1, label }));

/** Month index of a MonthKey ('m1' → 1). */
const monthIndex = (key: string): number => Number(key.slice(1));

/**
 * Custom date-range picker (P2.5b). Two month dropdowns (From / To) that filter the
 * whole Analytics page. It reflects the active period's span (so a named period like
 * FY shows Jan–Dec); editing either end switches the global period to a custom range.
 */
@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './date-range-picker.component.html',
})
export class DateRangePickerComponent {
  private readonly data = inject(DashboardDataService);
  readonly months = MONTHS;

  readonly vm$ = this.data.period$.pipe(
    map((period: Period): RangeVm => {
      const ms = monthsOf(period).map(monthIndex);
      return {
        from: ms[0] ?? 1,
        to: ms[ms.length - 1] ?? 12,
        isCustom: typeof period !== 'string',
      };
    }),
  );

  /** Set the custom range from the two selects (the other end comes from the current vm). */
  setFrom(from: number, to: number): void {
    this.data.setPeriod({ from, to });
  }

  setTo(from: number, to: number): void {
    this.data.setPeriod({ from, to });
  }
}
