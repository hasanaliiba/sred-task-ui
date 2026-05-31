import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountUpDirective, formatCount } from './count-up.directive';

describe('formatCount', () => {
  it('groups thousands and applies fixed decimals', () => {
    expect(formatCount(1234567, 0, '', '')).toBe('1,234,567');
    expect(formatCount(1900, 0, '$', '')).toBe('$1,900');
    expect(formatCount(24.0345, 2, '$', '/h')).toBe('$24.03/h');
    expect(formatCount(80, 0, '', ' h')).toBe('80 h');
  });
});

@Component({
  standalone: true,
  imports: [CountUpDirective],
  template: `<span [appCountUp]="value" [countUpDuration]="0" countUpPrefix="$"></span>`,
})
class HostComponent {
  value = 5000;
}

describe('CountUpDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('writes the final, formatted value immediately when duration is 0', () => {
    fixture.detectChanges(); // ngOnInit
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.textContent).toBe('$5,000');
  });
});
