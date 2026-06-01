import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DashboardDataService } from '../../services/dashboard-data.service';

/**
 * Feedback modal (Feature G), controlled by an `open` input. Triggered from the
 * sidebar (Phase 2) instead of a floating button. Message + 1–5 star rating →
 * addFeedback (tagged to the active client) → thank-you state.
 */
@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-modal.component.html',
})
export class FeedbackModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DashboardDataService);

  readonly stars = [1, 2, 3, 4, 5];
  submitted = false;

  private _open = false;
  @Input()
  set open(value: boolean) {
    this._open = value;
    if (value) {
      this.submitted = false;
      this.form.reset({ rating: 0, message: '' });
    }
  }
  get open(): boolean {
    return this._open;
  }

  @Output() close = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    rating: [0, [Validators.required, Validators.min(1)]],
    message: ['', Validators.required],
  });

  get ratingInvalid(): boolean {
    const c = this.form.controls.rating;
    return c.invalid && c.touched;
  }
  get messageInvalid(): boolean {
    const c = this.form.controls.message;
    return c.invalid && c.touched;
  }
  get rating(): number {
    return this.form.controls.rating.value;
  }

  setRating(value: number): void {
    this.form.controls.rating.setValue(value);
    this.form.controls.rating.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { message, rating } = this.form.getRawValue();
    this.data.addFeedback(message, rating);
    this.submitted = true;
  }

  onClose(): void {
    this.close.emit();
  }
}
