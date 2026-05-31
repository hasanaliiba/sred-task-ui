import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Project } from '../../models';

/** Add / edit project modal (Feature F). Emits a complete Project; the manager decides add vs update. */
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() save = new EventEmitter<Project>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    color: ['#007bff'],
    isSred: [true],
  });

  get isEdit(): boolean {
    return this.project !== null;
  }

  get nameInvalid(): boolean {
    const c = this.form.controls.name;
    return c.invalid && c.touched;
  }

  ngOnInit(): void {
    if (this.project) {
      this.form.setValue({
        name: this.project.name,
        color: this.project.color,
        isSred: this.project.isSred,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      id: this.project?.id ?? this.newId(),
      name: v.name.trim(),
      color: v.color,
      isSred: v.isSred,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `p-${crypto.randomUUID()}`
      : `p-${Date.now()}`;
  }
}
