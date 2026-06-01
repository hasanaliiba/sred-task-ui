import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, firstValueFrom } from 'rxjs';

import { ProjectsSummaryComponent } from './projects-summary.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Client, GrandTotals, Metric, ProjectSummary } from '../../models';

const SUMMARIES: ProjectSummary[] = [
  { projectId: 'p1', name: 'Rendering', color: '#28a745', isSred: true, hours: 80, laborAmount: 1900, vendorAmount: 0, sredVendorAmount: 0, amount: 1900 },
  { projectId: 'p2', name: 'API', color: '#dc3545', isSred: true, hours: 200, laborAmount: 9000, vendorAmount: 1000, sredVendorAmount: 1000, amount: 10000 },
];
const TOTALS: GrandTotals = { totalHours: 280, totalLaborAmount: 10900, totalVendorAmount: 1000, totalAmount: 11900 };
const CLIENT = { sredCreditRate: 0.5 } as Client;

class FakeDataService {
  grandTotals$ = of(TOTALS);
  projectSummaries$ = of(SUMMARIES);
  client$ = of(CLIENT);
  metric$ = new BehaviorSubject<Metric>('hours');
}

describe('ProjectsSummaryComponent', () => {
  let component: ProjectsSummaryComponent;
  let fixture: ReturnType<typeof TestBed.createComponent<ProjectsSummaryComponent>>;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectsSummaryComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(ProjectsSummaryComponent);
    component = fixture.componentInstance;
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('builds the donut from per-project HOURS by default (largest slice first)', async () => {
    const donut = await firstValueFrom(component.donut$);
    expect(donut.empty).toBeFalse();
    expect(donut.metricLabel).toBe('Hours');
    expect(donut.series).toEqual([200, 80]); // hours, sorted desc
    expect(donut.labels).toEqual(['API', 'Rendering']);
    expect(donut.colors).toEqual(['#dc3545', '#28a745']);
  });

  it('switches the donut to expenditure / credit with the metric', async () => {
    data.metric$.next('expenditure');
    let donut = await firstValueFrom(component.donut$);
    expect(donut.series).toEqual([10000, 1900]); // amounts, sorted desc

    data.metric$.next('credit');
    donut = await firstValueFrom(component.donut$);
    // p2: (9000 + 1000 sred vendor) × 0.5 = 5000; p1: SR&ED labor 1900 × 0.5 = 950
    expect(donut.series).toEqual([5000, 950]);
  });

  it('groups the smallest projects into a single "Other" slice past 7 projects', async () => {
    // 9 SR&ED projects with hours 90..10 → keep top 6 individually, roll the rest into "Other".
    data.projectSummaries$ = of(
      Array.from({ length: 9 }, (_, i) => ({
        projectId: `p${i}`, name: `P${i}`, color: '#000', isSred: true,
        hours: 90 - i * 10, laborAmount: 0, vendorAmount: 0, sredVendorAmount: 0, amount: 0,
      })),
    );
    const c = TestBed.createComponent(ProjectsSummaryComponent).componentInstance;
    const donut = await firstValueFrom(c.donut$);
    expect(donut.series.length).toBe(7); // 6 kept + Other
    expect(donut.labels[6]).toBe('Other');
    // Other = hours of the 3 smallest (30 + 20 + 10) = 60.
    expect(donut.series[6]).toBe(60);
  });

  it('flags empty when the active metric is zero everywhere', async () => {
    data.projectSummaries$ = of([
      { projectId: 'p1', name: 'X', color: '#000', isSred: true, hours: 0, laborAmount: 0, vendorAmount: 0, sredVendorAmount: 0, amount: 0 },
    ]);
    const c = TestBed.createComponent(ProjectsSummaryComponent).componentInstance;
    const donut = await firstValueFrom(c.donut$);
    expect(donut.empty).toBeTrue();
  });

  it('renders the grand totals strip', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Total hours');
    expect(text).toContain('Total amount');
  });
});
