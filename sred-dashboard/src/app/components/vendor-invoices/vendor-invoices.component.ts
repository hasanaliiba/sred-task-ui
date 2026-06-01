import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { Project, VendorInvoice } from '../../models';
import { VendorFormComponent } from '../vendor-form/vendor-form.component';
import { PaginatorComponent } from '../paginator/paginator.component';

/**
 * Vendor invoices table + CRUD (Feature E). Lists the selected period's invoices
 * (with their project name), supports add / edit / remove, shows the vendor total,
 * and paginates the table client-side (~10/page). SR&ED-flagged invoices feed SR&ED
 * expenditure and each invoice rolls into its project's totals.
 */
@Component({
  selector: 'app-vendor-invoices',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, VendorFormComponent, PaginatorComponent],
  templateUrl: './vendor-invoices.component.html',
})
export class VendorInvoicesComponent {
  private readonly data = inject(DashboardDataService);

  readonly pageSize = 10;
  private readonly page$ = new BehaviorSubject<number>(1);

  /** Period-filtered invoices joined with project names + paged rows + the vendor total + project list. */
  readonly vm$ = combineLatest([this.data.vendorInvoices$, this.data.projectSummaries$, this.page$]).pipe(
    map(([invoices, summaries, page]) => {
      const nameById = new Map(summaries.map((s) => [s.projectId, s.name]));
      const allRows = invoices.map((invoice) => ({
        invoice,
        projectName: nameById.get(invoice.projectId) ?? invoice.projectId,
      }));
      const count = allRows.length;
      const pages = Math.max(1, Math.ceil(count / this.pageSize));
      const current = Math.min(page, pages);
      const start = (current - 1) * this.pageSize;
      return {
        rows: allRows.slice(start, start + this.pageSize),
        count,
        page: current,
        pageSize: this.pageSize,
        amountTotal: invoices.reduce((sum, v) => sum + v.amount, 0),
        projects: summaries.map(
          (s) => ({ id: s.projectId, name: s.name, color: s.color, isSred: s.isSred }) as Project,
        ),
      };
    }),
  );

  setPage(page: number): void {
    this.page$.next(page);
  }

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
