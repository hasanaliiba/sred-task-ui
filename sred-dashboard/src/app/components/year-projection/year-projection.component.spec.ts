import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { YearProjectionComponent } from './year-projection.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Client, Projection } from '../../models';

const PROJECTION: Projection = {
  fractionElapsed: 0.875,
  ytdHours: 8750, projectedHours: 10000, remainingHours: 1250,
  ytdAmount: 437500, projectedAmount: 500000, remainingAmount: 62500,
  ytdCredit: 175000, projectedCredit: 200000,
};
const CLIENT = { asOfDate: '2025-11-15' } as Client;

class FakeDataService {
  projection$ = of(PROJECTION);
  client$ = of(CLIENT);
}

describe('YearProjectionComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<YearProjectionComponent>>;
  let component: YearProjectionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YearProjectionComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(YearProjectionComponent);
    component = fixture.componentInstance;
  });

  it('derives the elapsed-percent gauge from fractionElapsed', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.pct).toBe(88); // 0.875 → 88%
    expect(vm.gauge).toEqual([88]);
  });

  it('renders YTD and projected figures', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Year Projection');
    expect(text).toContain('Projected full year');
  });
});
