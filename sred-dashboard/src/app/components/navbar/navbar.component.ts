import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';

/** Section anchors the navbar links scroll to (filled in by later sprints). */
interface NavLink {
  id: string;
  label: string;
}

/**
 * Dashboard navigation bar (Req 2). Shows brand, active client, signed-in user,
 * time zone, logout, and in-page anchor links that smooth-scroll to each section.
 * Reads client/user reactively (async pipe); no signals.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly data = inject(DashboardDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly client$ = this.data.client$;
  readonly currentUser$ = this.auth.currentUser$;

  readonly links: NavLink[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'employees', label: 'Employees' },
    { id: 'teams', label: 'Teams' },
    { id: 'projects', label: 'Projects' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'projection', label: 'Projection' },
  ];

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /** Smooth-scroll to a section, respecting reduced-motion, and close the mobile menu. */
  scrollTo(id: string): void {
    this.menuOpen = false;
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
