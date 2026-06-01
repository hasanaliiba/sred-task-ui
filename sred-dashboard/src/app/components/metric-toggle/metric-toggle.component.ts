import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Metric } from '../../models';

interface MetricOption {
  value: Metric;
  label: string;
}

/**
 * Global metric toggle (Show Hours / Expenditures / Credits). Writes the active
 * metric to the data service; the Analytics views read `metric$` and reflect it.
 */
@Component({
  selector: 'app-metric-toggle',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './metric-toggle.component.html',
})
export class MetricToggleComponent {
  private readonly data = inject(DashboardDataService);
  readonly current$ = this.data.metric$;

  readonly options: MetricOption[] = [
    { value: 'hours', label: 'Hours' },
    { value: 'expenditure', label: 'Expenditures' },
    { value: 'credit', label: 'Credits' },
  ];

  select(metric: Metric): void {
    this.data.setMetric(metric);
  }
}
