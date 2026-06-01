import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Reusable client-side paginator (presentational). Parent slices its own rows by
 * page; this renders "showing X–Y of N" + prev/next + windowed page numbers and
 * emits `pageChange` (1-based). Always present (even for a single page, where
 * prev/next are disabled and only "1" shows) for consistent grid chrome.
 */
@Component({
  selector: 'app-paginator',
  standalone: true,
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() page = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  get start(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }
  get end(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /** Compact page list: first, last, current ± 1, with '…' gaps. */
  get visiblePages(): (number | string)[] {
    const total = this.pages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const wanted = new Set<number>([1, total, this.page, this.page - 1, this.page + 1]);
    const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out: (number | string)[] = [];
    let prev = 0;
    for (const n of sorted) {
      if (n - prev > 1) out.push('…');
      out.push(n);
      prev = n;
    }
    return out;
  }

  go(p: number | string): void {
    if (typeof p !== 'number' || p < 1 || p > this.pages || p === this.page) {
      return;
    }
    this.pageChange.emit(p);
  }

  prev(): void {
    this.go(this.page - 1);
  }
  next(): void {
    this.go(this.page + 1);
  }
}
