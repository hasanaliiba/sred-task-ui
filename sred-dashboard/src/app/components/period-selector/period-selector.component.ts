import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Period } from '../../models';

interface PeriodOption {
  value: Period;
  label: string;
}

/**
 * Global period selector (Feature B). Writes the selected period to the data
 * service; every grid and chart reacts because they're derived from period$.
 */
@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './period-selector.component.html',
})
export class PeriodSelectorComponent {
  private readonly data = inject(DashboardDataService);

  readonly current$ = this.data.period$;

  readonly options: PeriodOption[] = [
    { value: 'Q1', label: 'Q1' },
    { value: 'Q2', label: 'Q2' },
    { value: 'Q3', label: 'Q3' },
    { value: 'Q4', label: 'Q4' },
    { value: 'H1', label: 'H1' },
    { value: 'H2', label: 'H2' },
    { value: 'FY', label: 'Full Year' },
  ];

  select(period: Period): void {
    this.data.setPeriod(period);
  }
}
