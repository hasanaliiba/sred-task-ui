import { Component, Input } from '@angular/core';

import { initials } from '../../shared';

/**
 * Small circular initials avatar for grid name cells (P3.4b). We have no photo URLs,
 * so initials on a soft tint give a professional look. When a brand `color` is given
 * (team / project hex), the tint + text derive from it; otherwise a neutral slate.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <span
      class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      [style.backgroundColor]="bg"
      [style.color]="fg"
      aria-hidden="true"
    >{{ text }}</span>
  `,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() color: string | null = null;

  get text(): string {
    return initials(this.name);
  }
  /** Brand colour at ~13% opacity, else slate-200. */
  get bg(): string {
    return this.color ? `${this.color}22` : '#e2e8f0';
  }
  /** Brand colour for text, else slate-600. */
  get fg(): string {
    return this.color ?? '#475569';
  }
}
