import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  inject,
} from '@angular/core';

/** Pure formatter for an animated value — grouped thousands + fixed decimals + affixes. */
export function formatCount(
  value: number,
  decimals: number,
  prefix: string,
  suffix: string,
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${prefix}${formatted}${suffix}`;
}

/**
 * Feature A — count-up.
 *
 * Animates the host element's text from its previous value up to the target using
 * requestAnimationFrame with an ease-out curve. Re-animates when the value changes.
 * Respects `prefers-reduced-motion` (writes the final value immediately).
 *
 * Usage: <span [appCountUp]="totalHours" [countUpSuffix]="' h'"></span>
 *        <span [appCountUp]="amount" countUpPrefix="$" [countUpDecimals]="0"></span>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnChanges {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);

  @Input('appCountUp') value = 0;
  @Input() countUpDuration = 1200;
  @Input() countUpDecimals = 0;
  @Input() countUpPrefix = '';
  @Input() countUpSuffix = '';

  private current = 0;
  private rafId: number | null = null;

  ngOnInit(): void {
    this.animateTo(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.animateTo(this.value);
    }
  }

  private write(value: number): void {
    this.renderer.setProperty(
      this.host.nativeElement,
      'textContent',
      formatCount(value, this.countUpDecimals, this.countUpPrefix, this.countUpSuffix),
    );
  }

  private animateTo(target: number): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Reduced motion / no rAF / zero duration: jump to the final value.
    if (
      this.prefersReducedMotion() ||
      this.countUpDuration <= 0 ||
      typeof requestAnimationFrame === 'undefined'
    ) {
      this.current = target;
      this.write(target);
      return;
    }

    const from = this.current;
    const delta = target - from;
    const duration = this.countUpDuration;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    let startTs: number | null = null;

    const step = (ts: number) => {
      if (startTs === null) {
        startTs = ts;
      }
      const progress = Math.min(1, (ts - startTs) / duration);
      const value = from + delta * easeOutCubic(progress);
      this.current = value;
      this.write(value);
      if (progress < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.current = target;
        this.write(target);
        this.rafId = null;
      }
    };

    // Animation drives the DOM directly — no need to run inside Angular.
    this.zone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(step);
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
