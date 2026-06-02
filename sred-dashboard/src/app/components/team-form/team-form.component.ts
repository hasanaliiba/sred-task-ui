import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Employee, Team } from '../../models';

/**
 * Add / edit team modal. Emits the team (id/name/color) plus the chosen member ids;
 * the grid decides add vs update and writes membership via the service. Members are a
 * checklist of employees (membership is `employee.teamId` under the hood).
 */
@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './team-form.component.html',
})
export class TeamFormComponent implements OnInit {
  @Input() team: Team | null = null;
  @Input() employees: Employee[] = [];
  @Input() memberIds: string[] = [];
  @Output() save = new EventEmitter<{ team: Team; memberIds: string[] }>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    color: ['#007bff'],
  });

  selected = new Set<string>();

  get isEdit(): boolean {
    return this.team !== null;
  }

  get nameInvalid(): boolean {
    const c = this.form.controls.name;
    return c.invalid && c.touched;
  }

  ngOnInit(): void {
    if (this.team) {
      this.form.setValue({ name: this.team.name, color: this.team.color });
    }
    this.selected = new Set(this.memberIds);
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  toggle(id: string): void {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      team: { id: this.team?.id ?? this.newId(), name: v.name.trim(), color: v.color },
      memberIds: [...this.selected],
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `team-${crypto.randomUUID()}`
      : `team-${Date.now()}`;
  }
}
