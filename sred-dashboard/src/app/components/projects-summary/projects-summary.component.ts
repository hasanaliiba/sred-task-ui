import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexLegend,
  ApexDataLabels,
  ApexTooltip,
} from 'ng-apexcharts';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { CountUpDirective } from '../../shared';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * All-projects summary (Req 5): a grand-totals strip (count-up animated) plus a
 * donut of each project's dollar share with the grand total in the center.
 * Period-reactive via grandTotals$ / projectSummaries$.
 */
@Component({
  selector: 'app-projects-summary',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule, CountUpDirective],
  templateUrl: './projects-summary.component.html',
})
export class ProjectsSummaryComponent {
  private readonly data = inject(DashboardDataService);

  readonly totals$ = this.data.grandTotals$;

  /** Donut view-model — stable series/labels/colors per emission. */
  readonly donut$ = this.data.projectSummaries$.pipe(
    map((projects) => {
      const series = projects.map((p) => Math.round(p.amount)) as ApexNonAxisChartSeries;
      return {
        empty: series.length === 0 || series.every((v) => v === 0),
        series,
        labels: projects.map((p) => p.name),
        colors: projects.map((p) => p.color),
      };
    }),
  );

  readonly chart: ApexChart = { type: 'donut', height: 340, fontFamily: 'inherit', animations: { enabled: true } };
  readonly legend: ApexLegend = { position: 'bottom' };
  readonly dataLabels: ApexDataLabels = { enabled: true };
  readonly tooltip: ApexTooltip = { y: { formatter: (v) => money.format(v) } };
  readonly plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: (w: { globals: { seriesTotals: number[] } }) =>
              money.format(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
          },
        },
      },
    },
  };
}
