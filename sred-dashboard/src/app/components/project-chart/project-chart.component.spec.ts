import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { ProjectChartComponent } from './project-chart.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ProjectEmployeeStacks } from '../../models';

// Two projects, two employees: Anne 80h/$1,900 on Rendering; Bob 200h/$9,000 on API.
const STACKS: ProjectEmployeeStacks = {
  projects: [
    { id: 'p1', name: 'Rendering System', totalHours: 80, totalAmount: 1900 },
    { id: 'p2', name: 'API Performance', totalHours: 200, totalAmount: 9000 },
  ],
  employees: ['Anne', 'Bob'],
  hours: [
    [80, 0],
    [0, 200],
  ],
  amounts: [
    [1900, 0],
    [0, 9000],
  ],
};

class FakeDataService {
  projectEmployeeStacks$ = of(STACKS);
}

describe('ProjectChartComponent', () => {
  let component: ProjectChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectChartComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(ProjectChartComponent).componentInstance;
  });

  it('builds one stacked column series per employee (hours)', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.empty).toBeFalse();
    expect(vm.series.length).toBe(2); // one per employee, no total-cost line
    expect(vm.series[0].name).toBe('Anne');
    expect(vm.series[0].data).toEqual([80, 0]);
    expect(vm.series[1].name).toBe('Bob');
    expect(vm.series[1].data).toEqual([0, 200]);
  });

  it('labels the x-axis with project name + total cost (two lines)', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.xaxis.categories[0]).toEqual(['Rendering System', '$1,900']);
    expect(vm.xaxis.categories[1]).toEqual(['API Performance', '$9,000']);
  });

  it('uses a single hours y-axis and a per-segment (non-shared) tooltip', () => {
    expect(component.yaxis.title?.text).toBe('Hours');
    expect(component.tooltip.shared).toBeFalse();
    expect(component.tooltip.intersect).toBeTrue();
  });
});
