import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { CountUpDirective } from '../../shared';

/**
 * Year projection (Req 6). Three cards — SR&ED hours, expenditure, and credit — each
 * showing the selected period's actual figure as the headline, with the projected
 * full-year value (linear run-rate) as the secondary line. SR&ED-eligible work only.
 */
@Component({
  selector: 'app-year-projection',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, CountUpDirective],
  templateUrl: './year-projection.component.html',
})
export class YearProjectionComponent {
  private readonly data = inject(DashboardDataService);

  readonly vm$ = combineLatest([this.data.projection$, this.data.client$, this.data.expenditureSummary$]).pipe(
    map(([p, client, exp]) => ({ p, client, exp, pct: p ? Math.round(p.fractionElapsed * 100) : 0 })),
  );
}
