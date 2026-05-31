import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { EmployeeHoursChartComponent } from './employee-hours-chart.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { HoursSplit } from '../../models';

const ROWS: HoursSplit[] = [
  { id: 'e1', name: 'Anne', sredHours: 1430, unclaimedHours: 390, totalHours: 1820 },
  { id: 'e2', name: 'John', sredHours: 1610, unclaimedHours: 180, totalHours: 1790 },
];

class FakeDataService {
  employeeHoursBreakdown$ = of(ROWS);
}

describe('EmployeeHoursChartComponent', () => {
  let component: EmployeeHoursChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeHoursChartComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(EmployeeHoursChartComponent).componentInstance;
  });

  it('maps the breakdown into stacked SR&ED + Unclaimed series', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.categories).toEqual(['Anne', 'John']);
    expect(vm.series.length).toBe(2);
    expect(vm.series[0].name).toBe('SR&ED');
    expect(vm.series[0].data).toEqual([1430, 1610]);
    expect(vm.series[1].name).toBe('Unclaimed');
    expect(vm.series[1].data).toEqual([390, 180]);
  });

  it('carries a data-driven xaxis in the view-model (no per-CD method binding)', async () => {
    // Regression: xaxis MUST come from the emitted vm, not a template method call,
    // or ng-apexcharts recreates the chart every change-detection cycle and freezes.
    const vm = await firstValueFrom(component.vm$);
    expect(vm.xaxis.categories).toEqual(['Anne', 'John']);
    expect('xaxis' in component).toBeFalse(); // no xaxis() method on the component
  });

  it('configures a stacked bar chart', () => {
    expect(component.chart.type).toBe('bar');
    expect(component.chart.stacked).toBeTrue();
  });
});
