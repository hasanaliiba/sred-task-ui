import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { RevealDirective } from '../../shared';

/** Mock login screen (Feature G). Validates against seeded users and routes by role. */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  error = '';

  get usernameInvalid(): boolean {
    const c = this.form.controls.username;
    return c.invalid && c.touched;
  }

  get passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.invalid && c.touched;
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    const user = this.auth.login(username, password);
    if (!user) {
      this.error = 'Invalid username or password.';
      return;
    }
    this.router.navigate([user.role === 'admin' ? '/admin/feedback' : '/analytics']);
  }

  /** Convenience for the demo credential chips — fills and submits. */
  quickLogin(username: string): void {
    this.form.setValue({ username, password: 'sred2025' });
    this.submit();
  }
}
