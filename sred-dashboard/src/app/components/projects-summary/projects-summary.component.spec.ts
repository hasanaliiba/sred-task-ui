import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { ProjectsSummaryComponent } from './projects-summary.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { GrandTotals, ProjectSummary } from '../../models';

const SUMMARIES: ProjectSummary[] = [
  { projectId: 'p1', name: 'Rendering', color: '#28a745', isSred: true, hours: 80, laborAmount: 1900, vendorAmount: 0, amount: 1900 },
  { projectId: 'p2', name: 'API', color: '#dc3545', isSred: true, hours: 200, laborAmount: 9000, vendorAmount: 1000, amount: 10000 },
];
const TOTALS: GrandTotals = { totalHours: 280, totalLaborAmount: 10900, totalVendorAmount: 1000, totalAmount: 11900 };

class FakeDataService {
  grandTotals$ = of(TOTALS);
  projectSummaries$ = of(SUMMARIES);
}

describe('ProjectsSummaryComponent', () => {
  let component: ProjectsSummaryComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<ProjectsSummaryComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectsSummaryComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(ProjectsSummaryComponent);
    component = fixture.componentInstance;
  });

  it('builds the donut from per-project amounts with project colors', async () => {
    const donut = await firstValueFrom(component.donut$);
    expect(donut.empty).toBeFalse();
    expect(donut.series).toEqual([1900, 10000]);
    expect(donut.labels).toEqual(['Rendering', 'API']);
    expect(donut.colors).toEqual(['#28a745', '#dc3545']);
  });

  it('flags empty when there is no cost', async () => {
    const data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
    data.projectSummaries$ = of([
      { projectId: 'p1', name: 'X', color: '#000', isSred: true, hours: 0, laborAmount: 0, vendorAmount: 0, amount: 0 },
    ]);
    const c = TestBed.createComponent(ProjectsSummaryComponent).componentInstance;
    const donut = await firstValueFrom(c.donut$);
    expect(donut.empty).toBeTrue();
  });

  it('renders the count-up grand totals strip', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Total hours');
    expect(text).toContain('Total amount');
  });
});
