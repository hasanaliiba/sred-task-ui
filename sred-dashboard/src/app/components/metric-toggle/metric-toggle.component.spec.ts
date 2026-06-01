import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { MetricToggleComponent } from './metric-toggle.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Metric } from '../../models';

class FakeDataService {
  private readonly metric$$ = new BehaviorSubject<Metric>('hours');
  readonly metric$ = this.metric$$.asObservable();
  setMetric(m: Metric): void {
    this.metric$$.next(m);
  }
}

describe('MetricToggleComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<MetricToggleComponent>>;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MetricToggleComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(MetricToggleComponent);
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('renders Hours / Expenditures / Credits', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(3);
  });

  it('writes the selected metric to the service', () => {
    fixture.detectChanges();
    spyOn(data, 'setMetric').and.callThrough();
    fixture.componentInstance.select('credit');
    expect(data.setMetric).toHaveBeenCalledWith('credit');
  });

  it('marks the active metric as pressed', () => {
    data.setMetric('expenditure');
    fixture.detectChanges();
    const pressed = fixture.nativeElement.querySelector('button[aria-pressed="true"]') as HTMLElement;
    expect(pressed.textContent?.trim()).toBe('Expenditures');
  });
});
