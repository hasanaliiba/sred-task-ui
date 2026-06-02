import { Component } from '@angular/core';

import { InvoiceGridComponent } from '../../components/invoice-grid/invoice-grid.component';
import { ClientHeaderComponent } from '../../components/client-header/client-header.component';

/** Invoices management page (Manage group): vendor invoices + CRUD (full year). */
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [InvoiceGridComponent, ClientHeaderComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div class="sticky top-14 lg:top-0 z-20 bg-gray-50/95 backdrop-blur py-2">
        <app-client-header></app-client-header>
      </div>
      <app-invoice-grid></app-invoice-grid>
    </div>
  `,
})
export class InvoicesPageComponent {}
