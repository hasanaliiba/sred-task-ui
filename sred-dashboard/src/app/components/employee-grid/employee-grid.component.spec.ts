import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EmployeeGridComponent } from './employee-grid.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { EmployeeRow } from '../../models';

const ROWS: EmployeeRow[] = [
  {
    employee: { id: 'e1', name: 'Anne User', province: 'ON', startDate: '2021-01-01', endDate: null, confirmedSalary: null, expectedSalary: 60000, isSpecialEmployee: false, teamId: 't1' },
    effectiveSalary: 60000,
    hourlyRate: 30,
    team: { id: 't1', name: 'Rendering Team', color: '#28a745' },
  },
  {
    employee: { id: 'e2', name: 'Sophia', province: 'QC', startDate: '2020-01-01', endDate: null, confirmedSalary: null, expectedSalary: 110000, isSpecialEmployee: true, teamId: null },
    effectiveSalary: 110000,
    hourlyRate: 55,
    team: null,
  },
];

class FakeDataService {
  employees$ = of(ROWS);
  teams$ = of([{ id: 't1', name: 'Rendering Team', color: '#28a745' }]);
  addEmployee = jasmine.createSpy('addEmployee');
  updateEmployee = jasmine.createSpy('updateEmployee');
  removeEmployee = jasmine.createSpy('removeEmployee');
}

describe('EmployeeGridComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<EmployeeGridComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeGridComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(EmployeeGridComponent);
    fixture.detectChanges();
  });

  it('renders one row per employee', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('shows the derived hourly rate formatted as currency', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('$30.00');
    expect(text).toContain('$55.00');
  });

  it('flags specified employees and unassigned team', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Specified');
    expect(text).toContain('Unassigned');
  });
});
