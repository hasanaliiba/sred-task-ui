import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

/**
 * Feature A — on-scroll reveal.
 *
 * Fades + slides an element into view the first time it enters the viewport,
 * using an IntersectionObserver. Respects `prefers-reduced-motion` (leaves the
 * element visible, no animation). Optional `appRevealDelay` (ms) staggers groups.
 *
 * Usage: <section appReveal [appRevealDelay]="100"> ... </section>
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private observer?: IntersectionObserver;

  /** Stagger delay in milliseconds. */
  @Input() appRevealDelay = 0;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    // Reduced motion: don't hide/animate — show as-is.
    if (this.prefersReducedMotion()) {
      return;
    }

    // Initial hidden state + transition.
    this.renderer.setStyle(el, 'opacity', '0');
    this.renderer.setStyle(el, 'transform', 'translateY(16px)');
    this.renderer.setStyle(
      el,
      'transition',
      `opacity 600ms ease-out ${this.appRevealDelay}ms, transform 600ms ease-out ${this.appRevealDelay}ms`,
    );
    this.renderer.setStyle(el, 'will-change', 'opacity, transform');

    // No IntersectionObserver (very old env): reveal immediately.
    if (typeof IntersectionObserver === 'undefined') {
      this.reveal();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal();
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    this.observer.observe(el);
  }

  private reveal(): void {
    const el = this.host.nativeElement;
    this.renderer.setStyle(el, 'opacity', '1');
    this.renderer.setStyle(el, 'transform', 'translateY(0)');
    // Once the entrance finishes, drop the transform + will-change. A lingering
    // transform makes this element a containing block for position:fixed descendants,
    // which would trap modals (fixed inset-0) inside the section instead of the viewport.
    const stop = this.renderer.listen(el, 'transitionend', () => {
      this.renderer.removeStyle(el, 'transform');
      this.renderer.removeStyle(el, 'will-change');
      stop();
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
