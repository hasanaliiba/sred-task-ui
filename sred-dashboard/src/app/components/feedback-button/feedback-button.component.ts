import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DashboardDataService } from '../../services/dashboard-data.service';

/**
 * Floating feedback button + modal (Feature G). Clients submit a message and a
 * 1–5 star rating; addFeedback tags it to the active client. Shows a thank-you
 * state on success.
 */
@Component({
  selector: 'app-feedback-button',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './feedback-button.component.html',
})
export class FeedbackButtonComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DashboardDataService);

  readonly stars = [1, 2, 3, 4, 5];

  open = false;
  submitted = false;

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

  openPanel(): void {
    this.open = true;
    this.submitted = false;
    this.form.reset({ rating: 0, message: '' });
  }

  close(): void {
    this.open = false;
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
}
