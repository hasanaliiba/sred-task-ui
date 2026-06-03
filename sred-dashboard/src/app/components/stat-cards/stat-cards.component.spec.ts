import { TestBed } from '@angular/core/testing';

import { StatCardsComponent, StatCard } from './stat-cards.component';

describe('StatCardsComponent', () => {
  function render(cards: StatCard[]): string {
    const fixture = TestBed.createComponent(StatCardsComponent);
    fixture.componentInstance.cards = cards;
    fixture.detectChanges();
    return fixture.nativeElement.textContent as string;
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [StatCardsComponent] }));

  it('renders a card per entry with its label and value', () => {
    const text = render([
      { label: 'Employees', value: '12' },
      { label: 'SR&ED hours', value: '4,600 h' },
    ]);
    expect(text).toContain('Employees');
    expect(text).toContain('12');
    expect(text).toContain('SR&ED hours');
    expect(text).toContain('4,600 h');
  });

  it('shows the optional hint only when provided', () => {
    const fixture = TestBed.createComponent(StatCardsComponent);
    fixture.componentInstance.cards = [{ label: 'Vendor total', value: '$8,500', hint: 'all invoices' }];
    fixture.detectChanges();
    expect((fixture.nativeElement.textContent as string)).toContain('all invoices');

    fixture.componentInstance.cards = [{ label: 'Teams', value: '3' }];
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('p');
    // Label + value only — no third <p> (hint) for this card.
    expect(cards.length).toBe(2);
  });
});
