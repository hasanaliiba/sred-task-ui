import { Component } from '@angular/core';

import { InvoiceGridComponent } from '../../components/invoice-grid/invoice-grid.component';
import { ExpenditureSummaryComponent } from '../../components/expenditure-summary/expenditure-summary.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/**
 * Invoices management page (Manage group): vendor invoices + CRUD, plus the
 * government-assistance editor and the SR&ED-credit breakdown.
 */
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [InvoiceGridComponent, ExpenditureSummaryComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <app-client-header></app-client-header>
      <header>
        <h1 class="text-2xl font-bold text-ink">Invoices &amp; Credit</h1>
        <p class="text-sm text-gray-400">Vendor invoices, government assistance, and the resulting SR&amp;ED credit.</p>
      </header>
      <app-invoice-grid></app-invoice-grid>
      <app-expenditure-summary></app-expenditure-summary>
    </div>
  `,
})
export class InvoicesPageComponent {}
