import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * App-wide UI preferences (presentation only — not client data):
 *  - sidebar style: floating (detached, rounded, shadowed) vs flush (docked). Default floating.
 *  - sidebar pinned: expanded vs collapsed icon rail (expands on hover). Default collapsed;
 *    toggled from a button in the sidebar.
 * In-memory for the session.
 */
@Injectable({ providedIn: 'root' })
export class UiPreferencesService {
  private readonly floatingSidebar$$ = new BehaviorSubject<boolean>(true);
  readonly floatingSidebar$ = this.floatingSidebar$$.asObservable();

  /** Sidebar pinned open (expanded) vs collapsed icon rail (expands on hover). Default collapsed. */
  private readonly sidebarPinned$$ = new BehaviorSubject<boolean>(false);
  readonly sidebarPinned$ = this.sidebarPinned$$.asObservable();

  setFloatingSidebar(on: boolean): void {
    this.floatingSidebar$$.next(on);
  }

  toggleSidebarPinned(): void {
    this.sidebarPinned$$.next(!this.sidebarPinned$$.value);
  }
}
