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
 * Employee hours chart (Feature H, screenshot pg. 4): a stacked bar per employee
 * of SR&ED vs Unclaimed hours for the selected period. Period-reactive via
 * employeeHoursBreakdown$.
 */
@Component({
  selector: 'app-employee-hours-chart',
  standalone: true,
  imports: [AsyncPipe, NgApexchartsModule],
  templateUrl: './employee-hours-chart.component.html',
})
export class EmployeeHoursChartComponent {
  private readonly data = inject(DashboardDataService);

  /**
   * View-model: map the hours breakdown into ApexCharts series + a STABLE xaxis
   * object. The xaxis must be part of the emitted vm (not produced by a method in
   * the template): ng-apexcharts re-creates the whole chart whenever any non-series
   * input reference changes, so a per-change-detection new object would loop forever.
   */
  readonly vm$ = this.data.employeeHoursBreakdown$.pipe(
    map((rows) => ({
      categories: rows.map((r) => r.name),
      series: [
        { name: 'SR&ED', data: rows.map((r) => r.sredHours) },
        { name: 'Unclaimed', data: rows.map((r) => r.unclaimedHours) },
      ] as ApexAxisChartSeries,
      xaxis: { categories: rows.map((r) => r.name) } as ApexXAxis,
    })),
  );

  readonly chart: ApexChart = {
    type: 'bar',
    height: 360,
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: false },
    selection: { enabled: false },
    animations: { enabled: true },
    fontFamily: 'inherit',
  };
  readonly colors = ['#007bff', '#cbd5e1']; // SR&ED (brand) vs Unclaimed (slate-300)
  readonly plotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
  };
  readonly dataLabels: ApexDataLabels = { enabled: false };
  readonly legend: ApexLegend = { position: 'top', horizontalAlign: 'right' };
  readonly yaxis: ApexYAxis = { title: { text: 'Hours' } };
  readonly tooltip: ApexTooltip = { y: { formatter: (v) => `${v} h` } };
}
