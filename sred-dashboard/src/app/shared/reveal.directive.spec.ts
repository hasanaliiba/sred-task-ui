import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevealDirective } from './reveal.directive';

@Component({
  standalone: true,
  imports: [RevealDirective],
  template: `<div appReveal data-testid="target">content</div>`,
})
class HostComponent {}

describe('RevealDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('starts the element hidden (opacity 0, translated) before it scrolls into view', () => {
    // Headless Chrome does not prefer reduced motion, so the directive applies
    // the initial hidden state in ngAfterViewInit.
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('[data-testid="target"]') as HTMLElement;
    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toContain('translateY(16px)');
    expect(el.style.transition).toContain('opacity');
  });
});
