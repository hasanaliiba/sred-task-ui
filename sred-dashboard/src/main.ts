import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Global ApexCharts defaults — applied to every chart so they share one look instead of
 * the library default: inherit the Inter UI font, very light horizontal gridlines, no
 * vertical gridlines, softer axis-label color, and a light tooltip. Per-chart configs
 * still override where needed (stable-reference rule unaffected — this runs once).
 */
(window as unknown as { Apex?: unknown }).Apex = {
  chart: { fontFamily: 'inherit', foreColor: '#64748b' },
  grid: {
    borderColor: '#eef2f7',
    strokeDashArray: 0,
    xaxis: { lines: { show: false } },
  },
  tooltip: { theme: 'light' },
  legend: { fontSize: '12px' },
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
