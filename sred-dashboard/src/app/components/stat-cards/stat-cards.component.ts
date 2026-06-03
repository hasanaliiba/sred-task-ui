import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/** One metric tile in a Manage-page stat row. `value`/`hint` are pre-formatted strings. */
export interface StatCard {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Presentational row of full-year stat cards for the Manage pages (P3.4). Dumb by
 * design — each page computes and formats its own figures, then passes them in;
 * this component only lays them out in a responsive grid.
 */
@Component({
  selector: 'app-stat-cards',
  standalone: true,
  host: { class: 'block' },
  imports: [NgClass],
  template: `
    <div class="grid gap-4 sm:grid-cols-2" [ngClass]="gridCols">
      @for (c of cards; track c.label) {
        <div class="bg-white rounded-xl shadow ring-1 ring-gray-100 p-5">
          <p class="text-xs uppercase tracking-wide text-gray-400">{{ c.label }}</p>
          <p class="text-2xl font-extrabold text-ink mt-1">{{ c.value }}</p>
          @if (c.hint) {
            <p class="text-xs text-gray-400 mt-1">{{ c.hint }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class StatCardsComponent {
  @Input() cards: StatCard[] = [];

  /** Spread the cards across the full row: column count matches the number of cards. */
  get gridCols(): string {
    switch (this.cards.length) {
      case 1:
        return 'lg:grid-cols-1';
      case 2:
        return 'lg:grid-cols-2';
      case 3:
        return 'lg:grid-cols-3';
      default:
        return 'lg:grid-cols-4';
    }
  }
}
