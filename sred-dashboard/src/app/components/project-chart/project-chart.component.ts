import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map, tap } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { ProjectEmployeeStacks } from '../../models';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Distinct, accessible-ish series colours cycled across employees. */
const PALETTE = ['#5b8def', '#00b7ff', '#28a745', '#fd7e14', '#6f42c1', '#e83e8c', '#20c997', '#f59e0b', '#14b8a6', '#ef4444', '#8b5cf6', '#0ea5e9'];

/**
 * Per-project hours & cost (Req 4): a stacked column per project, stacked by employee
 * (hours). Hovering an individual block shows just that employee's hours + cost; the
 * x-axis label is the project name + its total labor cost.
 */
@Component({
  selector: 'app-project-chart',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule],
  templateUrl: './project-chart.component.html',
})
export class ProjectChartComponent {
  private readonly data = inject(DashboardDataService);
  /** Latest stacks — read by the (stable) custom tooltip below. */
  private latest: ProjectEmployeeStacks | null = null;

  readonly vm$ = this.data.projectEmployeeStacks$.pipe(
    tap((s) => (this.latest = s)),
    map((s) => ({
      empty: s.projects.length === 0,
      series: s.employees.map((name, i) => ({
        name,
        data: s.hours[i].map((h) => Math.round(h)),
      })) as ApexAxisChartSeries,
      // Two-line x-axis label: project name + its total cost.
      xaxis: { categories: s.projects.map((p) => [p.name, money.format(p.totalAmount)]) } as ApexXAxis,
      colors: s.employees.map((_, i) => PALETTE[i % PALETTE.length]),
    })),
  );

  readonly chart: ApexChart = {
    type: 'bar',
    height: 420,
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: false },
    selection: { enabled: false },
    animations: { enabled: true },
    fontFamily: 'inherit',
  };
  readonly plotOptions: ApexPlotOptions = { bar: { columnWidth: '55%', borderRadius: 4 } };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly legend: ApexLegend = { position: 'bottom', horizontalAlign: 'center' };
  readonly yaxis: ApexYAxis = { title: { text: 'Hours' }, labels: { formatter: (v) => `${Math.round(v)}` } };
  readonly tooltip: ApexTooltip = {
    // Per-block: hovering one employee's segment shows just that employee.
    shared: false,
    intersect: true,
    custom: ({ seriesIndex, dataPointIndex }: { seriesIndex: number; dataPointIndex: number }) =>
      this.renderTooltip(seriesIndex, dataPointIndex),
  };

  private renderTooltip(seriesIndex: number, projectIndex: number): string {
    const s = this.latest;
    const name = s?.employees[seriesIndex];
    const proj = s?.projects[projectIndex];
    if (!s || !name || !proj) {
      return '';
    }
    const hours = s.hours[seriesIndex]?.[projectIndex] ?? 0;
    const amount = s.amounts[seriesIndex]?.[projectIndex] ?? 0;
    return `<div class="px-3 py-2 text-xs">
      <div class="font-semibold text-ink">${name}</div>
      <div class="text-gray-400 mb-1.5">${proj.name}</div>
      <div class="flex items-center justify-between gap-6"><span class="text-gray-500">Hours</span><span class="font-medium text-gray-800">${Math.round(hours)} h</span></div>
      <div class="flex items-center justify-between gap-6"><span class="text-gray-500">Cost</span><span class="font-medium text-gray-800">${money.format(amount)}</span></div>
    </div>`;
  }
}
