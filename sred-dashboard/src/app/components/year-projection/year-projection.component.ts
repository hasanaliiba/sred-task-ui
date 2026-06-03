import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
} from 'ng-apexcharts';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { CountUpDirective } from '../../shared';

/**
 * Year projection (Req 6). Compares year-to-date vs projected full-year for hours,
 * dollars, and SR&ED credit, using the linear run-rate from the data layer, plus a
 * gauge of how much of the fiscal year has elapsed (the basis of the projection).
 */
@Component({
  selector: 'app-year-projection',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, NgApexchartsModule, CountUpDirective],
  templateUrl: './year-projection.component.html',
})
export class YearProjectionComponent {
  private readonly data = inject(DashboardDataService);

  readonly vm$ = combineLatest([this.data.projection$, this.data.client$, this.data.expenditureSummary$]).pipe(
    map(([p, client, exp]) => {
      const pct = p ? Math.round(p.fractionElapsed * 100) : 0;
      return { p, client, exp, pct, gauge: [pct] as ApexNonAxisChartSeries };
    }),
  );

  // Semicircle gauge (apexcharts "basic gauge"): half the vertical footprint of a full radial.
  readonly chart: ApexChart = { type: 'radialBar', height: 150, offsetY: 0, fontFamily: 'inherit' };
  readonly gaugeLabels = ['Year elapsed'];
  readonly plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: { size: '58%' },
      track: { background: '#e6f2ff', strokeWidth: '100%' },
      dataLabels: {
        name: { show: false },
        value: { fontSize: '22px', fontWeight: 700, offsetY: 4, color: '#324455', formatter: (v) => `${v}%` },
      },
    },
  };
  readonly gaugeColors = ['#007bff'];
}
