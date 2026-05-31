import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { PeriodSelectorComponent } from './period-selector.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Period } from '../../models';

class FakeDataService {
  private readonly period$$ = new BehaviorSubject<Period>('FY');
  readonly period$ = this.period$$.asObservable();
  setPeriod(p: Period): void {
    this.period$$.next(p);
  }
}

describe('PeriodSelectorComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<PeriodSelectorComponent>>;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PeriodSelectorComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(PeriodSelectorComponent);
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('renders all seven period options', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(7);
  });

  it('writes the selected period to the data service', () => {
    fixture.detectChanges();
    spyOn(data, 'setPeriod').and.callThrough();
    fixture.componentInstance.select('H2');
    expect(data.setPeriod).toHaveBeenCalledWith('H2');
  });

  it('marks the active period as pressed', () => {
    data.setPeriod('Q3');
    fixture.detectChanges();
    const pressed = fixture.nativeElement.querySelector('button[aria-pressed="true"]') as HTMLElement;
    expect(pressed.textContent?.trim()).toBe('Q3');
  });
});
