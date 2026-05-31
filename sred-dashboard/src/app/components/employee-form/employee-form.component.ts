import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Employee, Team } from '../../models';

const PROVINCES = ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'];

/**
 * Add / edit employee modal (Feature C). Emits a complete Employee on save; the
 * grid decides whether to add or update. No store access here — pure form.
 */
@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  /** Employee to edit; null = add mode. */
  @Input() employee: Employee | null = null;
  @Input() teams: Team[] = [];

  @Output() save = new EventEmitter<Employee>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly provinces = PROVINCES;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    province: ['ON', Validators.required],
    startDate: ['', Validators.required],
    endDate: [''],
    expectedSalary: [null as number | null],
    confirmedSalary: [null as number | null],
    isSpecialEmployee: [false],
    teamId: [''],
  });

  get isEdit(): boolean {
    return this.employee !== null;
  }

  ngOnInit(): void {
    if (this.employee) {
      const e = this.employee;
      this.form.setValue({
        name: e.name,
        province: e.province,
        startDate: e.startDate,
        endDate: e.endDate ?? '',
        expectedSalary: e.expectedSalary,
        confirmedSalary: e.confirmedSalary,
        isSpecialEmployee: e.isSpecialEmployee,
        teamId: e.teamId ?? '',
      });
    }
  }

  get nameInvalid(): boolean {
    const c = this.form.controls.name;
    return c.invalid && c.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const employee: Employee = {
      id: this.employee?.id ?? this.newId(),
      name: v.name.trim(),
      province: v.province,
      startDate: v.startDate,
      endDate: v.endDate ? v.endDate : null,
      expectedSalary: this.toAmount(v.expectedSalary),
      confirmedSalary: this.toAmount(v.confirmedSalary),
      isSpecialEmployee: v.isSpecialEmployee,
      teamId: v.teamId ? v.teamId : null,
    };
    this.save.emit(employee);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private toAmount(value: number | null): number | null {
    return value === null || (value as unknown as string) === '' || isNaN(Number(value))
      ? null
      : Number(value);
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `e-${crypto.randomUUID()}`
      : `e-${Date.now()}`;
  }
}
