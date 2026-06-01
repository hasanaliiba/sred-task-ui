import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Metric, Period } from '../../models';
import { periodMetricTotal } from '../../core/derivations';

type ViewMode = 'quarter' | 'month';

interface PeriodDef {
  value: Period;
  label: string;
}

interface Tile {
  period: Period;
  label: string;
  value: number;
  active: boolean;
}

interface TilesVm {
  tiles: Tile[];
  metricLabel: string;
  isCurrency: boolean;
  mode: ViewMode;
}

const QUARTER_PERIODS: PeriodDef[] = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
  { value: 'FY', label: 'Full Year' },
];

const MONTH_PERIODS: PeriodDef[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((label, i) => ({ value: `M${i + 1}` as Period, label }));

const METRIC_LABELS: Record<Metric, string> = {
  hours: 'Hours',
  expenditure: 'Expenditures',
  credit: 'Credits',
};

/**
 * Metric-aware period tiles (P2.5). One tile per period showing the active metric's
 * total; clicking a tile sets the global period. A local Quarter/Month toggle swaps
 * between the 5 quarter tiles and the 12 month tiles. View mode is local component
 * state (BehaviorSubject — no signals, per project convention).
 */
@Component({
  selector: 'app-summary-tiles',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe],
  templateUrl: './summary-tiles.component.html',
})
export class SummaryTilesComponent {
  private readonly data = inject(DashboardDataService);
  private readonly viewMode$$ = new BehaviorSubject<ViewMode>('quarter');
  readonly viewMode$ = this.viewMode$$.asObservable();

  readonly vm$ = combineLatest([
    this.data.activeWorkspace$,
    this.data.metric$,
    this.data.period$,
    this.viewMode$$,
  ]).pipe(
    map(([ws, metric, active, mode]): TilesVm => {
      const defs = mode === 'quarter' ? QUARTER_PERIODS : MONTH_PERIODS;
      const tiles: Tile[] = ws
        ? defs.map((d) => ({
            period: d.value,
            label: d.label,
            value: periodMetricTotal(ws, d.value, metric),
            active: d.value === active,
          }))
        : [];
      return { tiles, metricLabel: METRIC_LABELS[metric], isCurrency: metric !== 'hours', mode };
    }),
  );

  setViewMode(mode: ViewMode): void {
    this.viewMode$$.next(mode);
  }

  select(period: Period): void {
    this.data.setPeriod(period);
  }
}
