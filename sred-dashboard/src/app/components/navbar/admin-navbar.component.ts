import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

/**
 * Admin navigation bar (Req 2, Feature G). Mirrors the client navbar's styling but
 * navigates between the admin routes (Feedback, Client Settings) via routerLink,
 * with an active-link highlight, plus the signed-in admin and a logout button.
 */
@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.component.html',
})
export class AdminNavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser$ = this.auth.currentUser$;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
