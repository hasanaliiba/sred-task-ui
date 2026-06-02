import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexMarkers,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';

import { DashboardDataService } from '../../services/dashboard-data.service';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Team SR&ED hours & cost chart: per team, SR&ED hours (columns, left axis) and SR&ED
 * labor cost (line, right axis), where each team's cost = Σ members' (SR&ED hours ×
 * hourly rate). Only SR&ED-eligible hours are included. Period-reactive; stable-reference
 * chart inputs (vm). Mirrors the employee hours-&-cost chart, aggregated by team.
 */
@Component({
  selector: 'app-team-hour-and-cost-chart',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule],
  templateUrl: './team-hour-and-cost-chart.component.html',
})
export class TeamHourAndCostChartComponent {
  private readonly data = inject(DashboardDataService);

  readonly vm$ = this.data.teamCostBreakdown$.pipe(
    map((rows) => ({
      empty: rows.length === 0,
      series: [
        { name: 'SR&ED hours', type: 'column', data: rows.map((r) => r.sredHours) },
        { name: 'SR&ED cost', type: 'line', data: rows.map((r) => Math.round(r.sredCost)) },
      ] as ApexAxisChartSeries,
      xaxis: { categories: rows.map((r) => r.teamName) } as ApexXAxis,
    })),
  );

  readonly chart: ApexChart = {
    type: 'line',
    height: 360,
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false },
    selection: { enabled: false },
    animations: { enabled: true },
    fontFamily: 'inherit',
  };
  readonly colors = ['#007bff', '#fd7e14']; // SR&ED hours (brand) vs SR&ED cost (orange)
  readonly stroke: ApexStroke = { width: [0, 3], curve: 'smooth' };
  readonly markers: ApexMarkers = { size: [0, 4] };
  readonly plotOptions: ApexPlotOptions = { bar: { columnWidth: '50%', borderRadius: 4 } };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly legend: ApexLegend = { position: 'top', horizontalAlign: 'right' };
  readonly yaxis: ApexYAxis[] = [
    { seriesName: 'SR&ED hours', title: { text: 'SR&ED hours' } },
    {
      opposite: true,
      seriesName: 'SR&ED cost',
      title: { text: 'SR&ED cost ($)' },
      labels: { formatter: (v) => `$${compact.format(v)}` },
    },
  ];
  readonly tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: [{ formatter: (v) => `${v} h` }, { formatter: (v) => money.format(v) }],
  };
}
