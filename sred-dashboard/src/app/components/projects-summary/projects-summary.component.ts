import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
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
import { Metric } from '../../models';
import { projectMetricValue } from '../../core/derivations';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const METRIC_LABEL: Record<Metric, string> = { hours: 'Hours', expenditure: 'Expenditures', credit: 'Credits' };
const formatterFor = (metric: Metric) =>
  metric === 'hours' ? (v: number) => `${Math.round(v).toLocaleString()} h` : (v: number) => money.format(v);

/** Largest N slices kept individually; the remainder is grouped into a single "Other". */
const MAX_SLICES = 7;
const OTHER_COLOR = '#9ca3af';

interface Slice {
  name: string;
  value: number;
  color: string;
}

/**
 * Declutter the donut: drop zero-value slices, then if there are more than MAX_SLICES,
 * keep the largest (MAX_SLICES − 1) and roll the rest up into one "Other" slice.
 */
function groupSlices(slices: Slice[]): Slice[] {
  const visible = slices.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  if (visible.length <= MAX_SLICES) {
    return visible;
  }
  const kept = visible.slice(0, MAX_SLICES - 1);
  const otherValue = visible.slice(MAX_SLICES - 1).reduce((sum, s) => sum + s.value, 0);
  return [...kept, { name: 'Other', value: otherValue, color: OTHER_COLOR }];
}

/**
 * All-projects summary (Req 5): a grand-totals strip (count-up) plus a donut of each
 * project's share of the ACTIVE metric (hours / expenditure / credit), with the grand
 * total formatted in the center. Period- and metric-reactive.
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

  /** Donut view-model — metric-aware series + formatters (all stable per emission). */
  readonly donut$ = combineLatest([this.data.projectSummaries$, this.data.metric$, this.data.client$]).pipe(
    map(([projects, metric, client]) => {
      const rate = client?.sredCreditRate ?? 0;
      const fmt = formatterFor(metric);
      // SR&ED projects only — keeps the donut total in sync with the period tiles + projection.
      const slices = groupSlices(
        projects
          .filter((p) => p.isSred)
          .map((p) => ({ name: p.name, value: Math.round(projectMetricValue(p, metric, rate)), color: p.color })),
      );
      const series = slices.map((s) => s.value) as ApexNonAxisChartSeries;
      const plotOptions: ApexPlotOptions = {
        pie: {
          donut: {
            labels: {
              show: true,
              value: { formatter: (v: string) => fmt(Number(v)) },
              total: {
                show: true,
                label: 'Total',
                formatter: (w: { globals: { seriesTotals: number[] } }) =>
                  fmt(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
              },
            },
          },
        },
      };
      return {
        empty: series.length === 0 || series.every((v) => v === 0),
        metricLabel: METRIC_LABEL[metric],
        series,
        labels: slices.map((s) => s.name),
        colors: slices.map((s) => s.color),
        plotOptions,
        tooltip: { y: { formatter: fmt } } as ApexTooltip,
      };
    }),
  );

  readonly chart: ApexChart = { type: 'donut', height: 340, fontFamily: 'inherit', animations: { enabled: true } };
  readonly legend: ApexLegend = { position: 'bottom' };
  readonly dataLabels: ApexDataLabels = { enabled: true };
}
