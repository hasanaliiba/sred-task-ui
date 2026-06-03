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
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-ink">Invoices</h1>
          <p class="text-sm text-gray-500 mt-1">Non-labor vendor expenses (full year). SR&ED invoices add to the credit.</p>
        </div>
        <button
          type="button"
          (click)="grid.openAdd()"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
          Create invoice
        </button>
      </div>
      @if (stats$ | async; as cards) {
        <app-stat-cards [cards]="cards"></app-stat-cards>
      }
      <app-invoice-grid #grid></app-invoice-grid>
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
