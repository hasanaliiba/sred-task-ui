import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { CountUpDirective } from '../../shared';

/**
 * SR&ED expenditure & credit card (Feature E). Shows how the credit is built:
 * SR&ED labor + SR&ED vendor − government assistance, × credit rate. The government
 * assistance is editable here; SR&ED-flagged vendor invoices (toggled in S18) flow
 * into `sredVendor`, so toggling the flag visibly moves the credit.
 */
@Component({
  selector: 'app-expenditure-summary',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, PercentPipe, CountUpDirective],
  templateUrl: './expenditure-summary.component.html',
})
export class ExpenditureSummaryComponent {
  private readonly data = inject(DashboardDataService);

  readonly vm$ = combineLatest([this.data.expenditureSummary$, this.data.client$]).pipe(
    map(([exp, client]) => ({ exp, rate: client?.sredCreditRate ?? 0 })),
  );

  onAssistance(value: string): void {
    const amount = Number(value);
    this.data.setGovernmentAssistance(isNaN(amount) ? 0 : amount);
  }
}
