import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Project, VendorInvoice } from '../../models';
import { VendorFormComponent } from '../vendor-form/vendor-form.component';

/**
 * Vendor invoices table + CRUD (Feature E). Lists the selected period's invoices
 * (with their project name), supports add / edit / remove, and shows the vendor
 * total. SR&ED-flagged invoices feed SR&ED expenditure (S19) and each invoice rolls
 * into its project's totals.
 */
@Component({
  selector: 'app-vendor-invoices',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, VendorFormComponent],
  templateUrl: './vendor-invoices.component.html',
})
export class VendorInvoicesComponent {
  private readonly data = inject(DashboardDataService);

  /** Period-filtered invoices joined with project names + the vendor total + project list. */
  readonly vm$ = combineLatest([this.data.vendorInvoices$, this.data.projectSummaries$]).pipe(
    map(([invoices, summaries]) => {
      const nameById = new Map(summaries.map((s) => [s.projectId, s.name]));
      return {
        rows: invoices.map((invoice) => ({
          invoice,
          projectName: nameById.get(invoice.projectId) ?? invoice.projectId,
        })),
        total: invoices.reduce((sum, v) => sum + v.amount, 0),
        projects: summaries.map(
          (s) => ({ id: s.projectId, name: s.name, color: s.color, isSred: s.isSred }) as Project,
        ),
      };
    }),
  );

  formOpen = false;
  editing: VendorInvoice | null = null;
  pendingDelete: VendorInvoice | null = null;

  openAdd(): void {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(invoice: VendorInvoice): void {
    this.editing = invoice;
    this.formOpen = true;
  }

  onSave(invoice: VendorInvoice): void {
    if (this.editing) {
      this.data.updateVendorInvoice(invoice);
    } else {
      this.data.addVendorInvoice(invoice);
    }
    this.closeForm();
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
  }

  askDelete(invoice: VendorInvoice): void {
    this.pendingDelete = invoice;
  }

  confirmDelete(): void {
    if (this.pendingDelete) {
      this.data.removeVendorInvoice(this.pendingDelete.id);
    }
    this.pendingDelete = null;
  }

  cancelDelete(): void {
    this.pendingDelete = null;
  }
}
