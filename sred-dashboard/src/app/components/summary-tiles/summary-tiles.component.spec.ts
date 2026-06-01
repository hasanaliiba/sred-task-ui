import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';

import { SummaryTilesComponent } from './summary-tiles.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ClientWorkspace, Metric, MonthlyHours, Period } from '../../models';

const months = (over: Partial<MonthlyHours>): MonthlyHours => ({
  m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, ...over,
});

// One SR&ED project, one $100/h employee logging 10h in m1 → FY/Q1/M1 = 10h, $1,000, credit $500.
const WS: ClientWorkspace = {
  client: {
    id: 'wx', name: 'WX', loggedInUser: 'x', timeZone: 'EST',
    fiscalYearStart: '2025-01-01', fiscalYearEnd: '2025-12-31', asOfDate: '2025-12-31',
    standardAnnualHours: 2000, sredCreditRate: 0.5,
  },
  teams: [],
  employees: [{ id: 'a', name: 'A', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: 200000, expectedSalary: null, isSpecialEmployee: false, teamId: null }],
  projects: [{ id: 'p', name: 'P', color: '#000', isSred: true }],
  timesheets: [{ employeeId: 'a', projectId: 'p', hours: months({ m1: 10 }) }],
  vendorInvoices: [],
  governmentAssistanceTotal: 0,
};

class FakeDataService {
  activeWorkspace$ = of(WS);
  metric$ = new BehaviorSubject<Metric>('hours');
  period$ = new BehaviorSubject<Period>('FY');
  setPeriod = jasmine.createSpy('setPeriod');
}

describe('SummaryTilesComponent', () => {
  let component: SummaryTilesComponent;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SummaryTilesComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(SummaryTilesComponent).componentInstance;
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('shows 5 quarter tiles by default with the active-metric totals', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.mode).toBe('quarter');
    expect(vm.tiles.map((t) => t.period)).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'FY']);
    expect(vm.metricLabel).toBe('Hours');
    expect(vm.isCurrency).toBeFalse();
    expect(vm.tiles.find((t) => t.period === 'Q1')!.value).toBe(10);
    expect(vm.tiles.find((t) => t.period === 'Q2')!.value).toBe(0);
    expect(vm.tiles.find((t) => t.period === 'FY')!.value).toBe(10);
  });

  it('switches to 12 month tiles in by-month mode', async () => {
    component.setViewMode('month');
    const vm = await firstValueFrom(component.vm$);
    expect(vm.mode).toBe('month');
    expect(vm.tiles.length).toBe(12);
    expect(vm.tiles[0].label).toBe('Jan');
    expect(vm.tiles[0].value).toBe(10); // M1 = 10h
    expect(vm.tiles[1].value).toBe(0); // M2 = 0
  });

  it('reflects the metric: expenditure / credit are currency totals', async () => {
    data.metric$.next('expenditure');
    let vm = await firstValueFrom(component.vm$);
    expect(vm.metricLabel).toBe('Expenditures');
    expect(vm.isCurrency).toBeTrue();
    expect(vm.tiles.find((t) => t.period === 'FY')!.value).toBe(1000);

    data.metric$.next('credit');
    vm = await firstValueFrom(component.vm$);
    expect(vm.metricLabel).toBe('Credits');
    expect(vm.tiles.find((t) => t.period === 'FY')!.value).toBe(500); // 1000 × 0.5
  });

  it('marks the active period and writes the selection on click', async () => {
    data.period$.next('Q1');
    const vm = await firstValueFrom(component.vm$);
    expect(vm.tiles.find((t) => t.period === 'Q1')!.active).toBeTrue();
    expect(vm.tiles.find((t) => t.period === 'FY')!.active).toBeFalse();

    component.select('M3');
    expect(data.setPeriod).toHaveBeenCalledWith('M3');
  });
});
