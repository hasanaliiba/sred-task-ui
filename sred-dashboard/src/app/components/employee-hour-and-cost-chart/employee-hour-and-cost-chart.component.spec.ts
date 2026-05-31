import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { EmployeeHourAndCostChartComponent } from './employee-hour-and-cost-chart.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { EmployeeCost } from '../../models';

const ROWS: EmployeeCost[] = [
  { id: 'e1', name: 'Anne', hours: 1430, hourlyRate: 30, amount: 42900 },
  { id: 'e2', name: 'Liam', hours: 1630, hourlyRate: 65, amount: 105950 },
];

class FakeDataService {
  employeeCostBreakdown$ = of(ROWS);
}

describe('EmployeeHourAndCostChartComponent', () => {
  let component: EmployeeHourAndCostChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeHourAndCostChartComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(EmployeeHourAndCostChartComponent).componentInstance;
  });

  it('maps employees into SR&ED hours (column) + SR&ED cost (line) series with a data-driven xaxis', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.empty).toBeFalse();
    expect(vm.xaxis.categories).toEqual(['Anne', 'Liam']);
    expect(vm.series[0].name).toBe('SR&ED hours');
    expect(vm.series[0].data).toEqual([1430, 1630]);
    expect(vm.series[1].name).toBe('SR&ED cost');
    expect(vm.series[1].data).toEqual([42900, 105950]);
  });

  it('uses a dual y-axis (hours left, cost right)', () => {
    expect(component.yaxis.length).toBe(2);
    expect(component.yaxis[1].opposite).toBeTrue();
  });
});
