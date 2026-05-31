import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
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

/**
 * Team hours chart (Feature H, screenshot pg. 4): a stacked bar per team of SR&ED
 * vs Unclaimed hours for the selected period. Period-reactive via teamHoursBreakdown$.
 *
 * Note: xaxis/series live in the emitted view-model (stable references) — never a
 * template method call — so ng-apexcharts doesn't recreate the chart every change
 * detection cycle (see the S12 freeze fix).
 */
@Component({
  selector: 'app-team-hours-chart',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule],
  templateUrl: './team-hours-chart.component.html',
})
export class TeamHoursChartComponent {
  private readonly data = inject(DashboardDataService);

  readonly vm$ = this.data.teamHoursBreakdown$.pipe(
    map((teams) => ({
      categories: teams.map((t) => t.teamName),
      series: [
        { name: 'SR&ED', data: teams.map((t) => t.teamSredHours) },
        { name: 'Unclaimed', data: teams.map((t) => t.teamUnclaimedHours) },
      ] as ApexAxisChartSeries,
      xaxis: { categories: teams.map((t) => t.teamName) } as ApexXAxis,
    })),
  );

  readonly chart: ApexChart = {
    type: 'bar',
    height: 320,
    stacked: true,
    toolbar: { show: false },
    animations: { enabled: true },
    fontFamily: 'inherit',
  };
  readonly colors = ['#007bff', '#cbd5e1'];
  readonly plotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '45%', borderRadius: 4 },
  };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly legend: ApexLegend = { position: 'top', horizontalAlign: 'right' };
  readonly yaxis: ApexYAxis = { title: { text: 'Hours' } };
  readonly tooltip: ApexTooltip = { y: { formatter: (v) => `${v} h` } };
}
