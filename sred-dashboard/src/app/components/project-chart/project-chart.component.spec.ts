import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { ProjectChartComponent } from './project-chart.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ProjectSummary } from '../../models';

const SUMMARIES: ProjectSummary[] = [
  { projectId: 'p1', name: 'Rendering System', color: '#28a745', isSred: true, hours: 80, laborAmount: 1900, vendorAmount: 0, sredVendorAmount: 0, amount: 1900 },
  { projectId: 'p2', name: 'API Performance', color: '#dc3545', isSred: true, hours: 200, laborAmount: 9000, vendorAmount: 1000, sredVendorAmount: 1000, amount: 10000 },
];

class FakeDataService {
  projectSummaries$ = of(SUMMARIES);
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

  it('maps projects into hours (column) + amount (line) series with a data-driven xaxis', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.empty).toBeFalse();
    expect(vm.xaxis.categories).toEqual(['Rendering System', 'API Performance']);
    expect(vm.series[0].name).toBe('Hours');
    expect((vm.series[0] as { type: string }).type).toBe('column');
    expect(vm.series[0].data).toEqual([80, 200]);
    expect(vm.series[1].name).toBe('Amount');
    expect((vm.series[1] as { type: string }).type).toBe('line');
    expect(vm.series[1].data).toEqual([1900, 10000]);
  });

  it('uses a dual y-axis (hours left, amount right)', () => {
    expect(component.yaxis.length).toBe(2);
    expect(component.yaxis[1].opposite).toBeTrue();
  });
});
