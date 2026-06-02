import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EmployeeDetailComponent } from './employee-detail.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { EmployeeDetail } from '../../models';

const DETAIL: EmployeeDetail = {
  employee: { id: 'e1', name: 'Anne User', province: 'ON', startDate: '2021-01-01', endDate: null, confirmedSalary: null, expectedSalary: 60000, isSpecialEmployee: false, teamId: 't1' },
  perProject: [
    { projectId: 'p-render', name: 'Rendering System', color: '#28a745', isSred: true, hours: 1430 },
    { projectId: 'p-unclaimed', name: 'Unclaimed Work', color: '#6c757d', isSred: false, hours: 390 },
  ],
  sredHours: 1430,
  unclaimedHours: 390,
  totalHours: 1820,
  sredAllocation: 1430 / 1820,
  hourlyRate: 30,
  sredCost: 42900,
  totalCost: 54600,
  credit: 21450,
};

class FakeDataService {
  employeeDetailFull$ = jasmine.createSpy('employeeDetailFull$').and.returnValue(of(DETAIL));
}

describe('EmployeeDetailComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<EmployeeDetailComponent>>;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeDetailComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(EmployeeDetailComponent);
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
    fixture.componentInstance.employeeId = 'e1';
    fixture.detectChanges(); // ngOnInit
  });

  it('queries the service for the given employee id', () => {
    expect(data.employeeDetailFull$).toHaveBeenCalledWith('e1');
  });

  it('renders the name, per-project hours, and SR&ED allocation', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Anne User');
    expect(text).toContain('Rendering System');
    expect(text).toContain('1,430'); // SR&ED hours formatted
    expect(text).toContain('78.57%'); // 1430/1820 ≈ 78.57%
  });

  it('emits close when the close button is clicked', () => {
    spyOn(fixture.componentInstance.close, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('button') as HTMLElement;
    closeBtn.click();
    expect(fixture.componentInstance.close.emit).toHaveBeenCalled();
  });
});
