import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexYAxis,
  ApexStroke,
  ApexMarkers,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { stableXaxis } from '../../shared';
import { sredExpenditure } from '../../core/derivations';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Per-project chart (Req 4): hours worked and the monetary amount per project for
 * the selected period. Dual-axis combo — hours as columns (left), total $ (labor +
 * vendor) as a line (right). Reproduces the PDF example (80h → $1,900) for that project.
 *
 * Chart inputs are referentially stable (xaxis + series in the view-model) per the
 * S12 freeze lesson.
 */
@Component({
  selector: 'app-project-chart',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule],
  templateUrl: './project-chart.component.html',
})
export class ProjectChartComponent {
  private readonly data = inject(DashboardDataService);

  private readonly xaxisFor = stableXaxis();
  readonly vm$ = this.data.projectSummaries$.pipe(
    map((projects) => {
      const categories = projects.map((p) => p.name);
      return {
        empty: projects.length === 0,
        series: [
          { name: 'Hours', type: 'column', data: projects.map((p) => p.hours) },
          { name: 'Amount', type: 'line', data: projects.map((p) => Math.round(sredExpenditure(p))) },
        ] as ApexAxisChartSeries,
        xaxis: this.xaxisFor(categories),
      };
    }),
  );

  readonly chart: ApexChart = {
    type: 'line',
    height: 400,
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false },
    selection: { enabled: false },
    animations: { enabled: true },
    fontFamily: 'inherit',
  };
  readonly colors = ['#007bff', '#fd7e14']; // hours (brand) vs amount (orange)
  readonly stroke: ApexStroke = { width: [0, 3], curve: 'smooth' };
  readonly markers: ApexMarkers = { size: [0, 4] };
  readonly plotOptions: ApexPlotOptions = { bar: { columnWidth: '45%', borderRadius: 4 } };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly legend: ApexLegend = { position: 'top', horizontalAlign: 'right' };
  readonly yaxis: ApexYAxis[] = [
    { seriesName: 'Hours', title: { text: 'Hours' } },
    {
      opposite: true,
      seriesName: 'Amount',
      title: { text: 'Amount ($)' },
      labels: { formatter: (v) => `$${compact.format(v)}` },
    },
  ];
  readonly tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: [{ formatter: (v) => `${v} h` }, { formatter: (v) => money.format(v) }],
  };
}
