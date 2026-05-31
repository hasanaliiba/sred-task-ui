import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
} from 'ng-apexcharts';

/**
 * S0 toolchain-proof shell.
 *
 * Temporary: renders a Tailwind-styled card, a Flowbite button, and a sample
 * ApexChart to prove the stack is wired. The routed application shell replaces
 * this in S5 (the <router-outlet> is already wired via provideRouter).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgApexchartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly title = 'SR&ED Dashboard';

  readonly series: ApexAxisChartSeries = [
    { name: 'SR&ED hours', data: [120, 180, 200, 90] },
  ];
  readonly chart: ApexChart = { type: 'bar', height: 260, toolbar: { show: false } };
  readonly xaxis: ApexXAxis = { categories: ['Q1', 'Q2', 'Q3', 'Q4'] };
  readonly dataLabels: ApexDataLabels = { enabled: true };
  readonly plotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '45%' },
  };
}
