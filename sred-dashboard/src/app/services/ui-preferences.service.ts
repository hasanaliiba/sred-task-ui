import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * App-wide UI preferences (presentation only — not client data). Currently just the
 * sidebar style: floating (detached, rounded, shadowed) vs flush (docked to the edge).
 * Default is **flush**; toggled from the admin Settings page. In-memory for the session.
 */
@Injectable({ providedIn: 'root' })
export class UiPreferencesService {
  private readonly floatingSidebar$$ = new BehaviorSubject<boolean>(false);
  readonly floatingSidebar$ = this.floatingSidebar$$.asObservable();

  setFloatingSidebar(on: boolean): void {
    this.floatingSidebar$$.next(on);
  }
}
