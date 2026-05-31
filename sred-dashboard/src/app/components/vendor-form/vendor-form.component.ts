import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Project, VendorInvoice } from '../../models';

const PROVINCES = ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];
const STATUSES = ['In Progress', 'Completed', 'Submitted'];

/** Add / edit vendor invoice modal (Feature E). Emits a complete VendorInvoice. */
@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './vendor-form.component.html',
})
export class VendorFormComponent implements OnInit {
  @Input() invoice: VendorInvoice | null = null;
  @Input() projects: Project[] = [];

  @Output() save = new EventEmitter<VendorInvoice>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly provinces = PROVINCES;
  readonly statuses = STATUSES;

  readonly form = this.fb.nonNullable.group({
    invoiceDate: ['', Validators.required],
    invoiceNumber: [''],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    vendorName: ['', Validators.required],
    providerName: [''],
    projectId: ['', Validators.required],
    description: [''],
    isSred: [true],
    province: ['ON'],
    status: ['In Progress'],
  });

  get isEdit(): boolean {
    return this.invoice !== null;
  }

  invalid(name: 'invoiceDate' | 'amount' | 'vendorName' | 'projectId'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  ngOnInit(): void {
    if (this.invoice) {
      const i = this.invoice;
      this.form.setValue({
        invoiceDate: i.invoiceDate,
        invoiceNumber: i.invoiceNumber,
        amount: i.amount,
        vendorName: i.vendorName,
        providerName: i.providerName,
        projectId: i.projectId,
        description: i.description,
        isSred: i.isSred,
        province: i.province,
        status: i.status,
      });
    } else if (this.projects.length > 0) {
      this.form.controls.projectId.setValue(this.projects[0].id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      id: this.invoice?.id ?? this.newId(),
      invoiceDate: v.invoiceDate,
      invoiceNumber: v.invoiceNumber.trim(),
      amount: Number(v.amount),
      vendorName: v.vendorName.trim(),
      providerName: v.providerName.trim(),
      projectId: v.projectId,
      description: v.description.trim(),
      isSred: v.isSred,
      province: v.province,
      status: v.status,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `vi-${crypto.randomUUID()}`
      : `vi-${Date.now()}`;
  }
}
