import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models';
import { DashboardDataService } from './dashboard-data.service';

/**
 * Mock authentication (Feature G). Validates credentials against the seeded users
 * (loaded by DashboardDataService at startup). No real security — this is a
 * take-home demo. On client login the active client is set so the dashboard scopes
 * to that workspace; admins have no active client.
 *
 * State is in-memory (RxJS, no signals); a page refresh logs the user out.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly data = inject(DashboardDataService);
  private readonly currentUser$$ = new BehaviorSubject<User | null>(null);

  readonly currentUser$: Observable<User | null> = this.currentUser$$.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map((u) => u !== null));
  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(map((u) => u?.role === 'admin'));

  /** Attempts a login. Returns the user on success, or null on bad credentials. */
  login(username: string, password: string): User | null {
    const candidate = username.trim().toLowerCase();
    const user =
      this.data.users.find((u) => u.username === candidate && u.password === password) ?? null;
    if (!user) {
      return null;
    }
    this.currentUser$$.next(user);
    this.data.setActiveClient(user.role === 'client' ? user.clientId : null);
    return user;
  }

  logout(): void {
    this.currentUser$$.next(null);
    this.data.setActiveClient(null);
  }

  get currentUser(): User | null {
    return this.currentUser$$.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUser$$.value !== null;
  }

  get isAdmin(): boolean {
    return this.currentUser$$.value?.role === 'admin';
  }
}
