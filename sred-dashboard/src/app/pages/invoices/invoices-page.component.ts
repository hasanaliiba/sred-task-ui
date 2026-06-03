import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';

import { InvoiceGridComponent } from '../../components/invoice-grid/invoice-grid.component';
import { StatCardsComponent, StatCard } from '../../components/stat-cards/stat-cards.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { money } from '../../shared';

/** Invoices management page (Manage group): full-year stat cards + vendor invoices + CRUD. */
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [AsyncPipe, InvoiceGridComponent, StatCardsComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-invoice-grid></app-invoice-grid>
    </div>
  `,
})
export class InvoicesPageComponent {
  private readonly data = inject(DashboardDataService);

  readonly stats$ = this.data.vendorInvoicesAll$.pipe(
    map((invoices): StatCard[] => {
      const vendorTotal = invoices.reduce((sum, v) => sum + v.amount, 0);
      const sredVendor = invoices.filter((v) => v.isSred).reduce((sum, v) => sum + v.amount, 0);
      const sredCount = invoices.filter((v) => v.isSred).length;
      return [
        { label: 'Invoices', value: `${invoices.length}`, hint: `${sredCount} SR&ED` },
        { label: 'Vendor total', value: money(vendorTotal), hint: 'all invoices' },
        { label: 'SR&ED vendor', value: money(sredVendor), hint: 'flagged invoices' },
      ];
    }),
  );
}
