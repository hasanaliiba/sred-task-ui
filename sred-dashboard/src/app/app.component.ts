import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  Event as RouterEvent,
} from '@angular/router';
import { of, timer } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

/** Root shell — routed pages render through the outlet, with a top progress bar on navigation. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly title = 'SR&ED Dashboard';

  /**
   * True while a route navigation is in flight. Shows on NavigationStart; on
   * end/cancel/error it clears after a short delay so the bar stays visible (and
   * finishes its slide) even when navigation is near-instant.
   */
  readonly loading$ = this.router.events.pipe(
    filter(
      (e: RouterEvent): e is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
        e instanceof NavigationStart ||
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError,
    ),
    switchMap((e) => (e instanceof NavigationStart ? of(true) : timer(250).pipe(map(() => false)))),
    startWith(false),
    distinctUntilChanged(),
  );
}
