import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { DashboardDataService } from './dashboard-data.service';
import { DashboardSeed } from '../models';

const SEED: DashboardSeed = {
  users: [
    { username: 'acme', displayName: 'Acme', role: 'client', clientId: 'acme', password: 'p' },
    { username: 'admin', displayName: 'Admin', role: 'admin', clientId: null, password: 'p' },
  ],
  workspaces: [
    {
      client: {
        id: 'acme',
        name: 'Acme',
        loggedInUser: 'x',
        timeZone: 'EST',
        fiscalYearStart: '2025-01-01',
        fiscalYearEnd: '2025-12-31',
        asOfDate: '2025-12-31',
        standardAnnualHours: 2000,
        sredCreditRate: 0.5,
      },
      teams: [{ id: 't1', name: 'Team One', color: '#000' }],
      employees: [
        { id: 'e1', name: 'E1', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: null, expectedSalary: 60000, isSpecialEmployee: false, teamId: 't1' },
        { id: 'e2', name: 'E2', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: 40000, expectedSalary: null, isSpecialEmployee: false, teamId: null },
      ],
      projects: [
        { id: 'unc', name: 'Unclaimed', color: '#999', isSred: false },
        { id: 'sr', name: 'SRED Proj', color: '#0a0', isSred: true },
      ],
      timesheets: [
        // e1 @ $30/h; e2 @ $20/h
        { employeeId: 'e1', projectId: 'sr', hours: { q1: 100, q2: 0, q3: 0, q4: 0 } },
        { employeeId: 'e2', projectId: 'unc', hours: { q1: 0, q2: 50, q3: 0, q4: 0 } },
      ],
      vendorInvoices: [
        { id: 'v1', invoiceDate: '2025-02-01', invoiceNumber: 'A', amount: 1000, vendorName: 'V', providerName: 'P', projectId: 'sr', description: '', isSred: true, province: 'ON', status: 'Completed' },
      ],
      governmentAssistanceTotal: 500,
    },
  ],
  feedback: [
    { id: 'f1', clientId: 'acme', clientName: 'Acme', message: 'hi', rating: 5, submittedAt: '2025-01-01T00:00:00Z' },
  ],
};

describe('DashboardDataService', () => {
  let service: DashboardDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardDataService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushSeed(): void {
    service.load().subscribe();
    httpMock.expectOne('assets/data/dashboard-data.json').flush(SEED);
  }

  afterEach(() => httpMock.verify());

  it('exposes seeded users for auth after load', () => {
    flushSeed();
    expect(service.users.length).toBe(2);
    expect(service.users.find((u) => u.role === 'admin')).toBeTruthy();
  });

  it('scopes derived data to the active client', async () => {
    flushSeed();
    expect(await firstValueFrom(service.client$)).toBeNull(); // no client selected yet

    service.setActiveClient('acme');
    const client = await firstValueFrom(service.client$);
    expect(client?.name).toBe('Acme');

    const employees = await firstValueFrom(service.employees$);
    expect(employees.length).toBe(2);
    // e1: expected 60000 / 2000 = 30
    expect(employees.find((e) => e.employee.id === 'e1')?.hourlyRate).toBe(30);
  });

  it('reacts to period changes in project summaries', async () => {
    flushSeed();
    service.setActiveClient('acme');

    service.setPeriod('Q1');
    let totals = await firstValueFrom(service.grandTotals$);
    // Q1: e1 100h@$30 = 3000 labor on SRED + vendor 1000 (Feb=Q1) → 4000; unclaimed 0
    expect(totals.totalHours).toBe(100);
    expect(totals.totalAmount).toBe(4000);

    service.setPeriod('Q2');
    totals = await firstValueFrom(service.grandTotals$);
    // Q2: e2 50h@$20 = 1000 on unclaimed; no Q2 vendor
    expect(totals.totalHours).toBe(50);
    expect(totals.totalAmount).toBe(1000);

    service.setPeriod('FY');
    totals = await firstValueFrom(service.grandTotals$);
    expect(totals.totalHours).toBe(150);
    expect(totals.totalAmount).toBe(5000);
  });

  it('computes SR&ED expenditure and credit (period-aware)', async () => {
    flushSeed();
    service.setActiveClient('acme');
    service.setPeriod('FY');
    const exp = await firstValueFrom(service.expenditureSummary$);
    // sredLabor = e1 3000; sredVendor = 1000; total 4000; minus gov 500 = 3500; × 0.5 = 1750
    expect(exp?.sredLabor).toBe(3000);
    expect(exp?.sredVendor).toBe(1000);
    expect(exp?.creditableBase).toBe(3500);
    expect(exp?.creditAmount).toBe(1750);
  });

  it('adds an employee (immutably) and reflects it in employees$', async () => {
    flushSeed();
    service.setActiveClient('acme');
    service.addEmployee({
      id: 'e9', name: 'New Hire', province: 'ON', startDate: '2025-01-01', endDate: null,
      confirmedSalary: 100000, expectedSalary: null, isSpecialEmployee: false, teamId: null,
    });
    const employees = await firstValueFrom(service.employees$);
    expect(employees.length).toBe(3);
    expect(employees.find((e) => e.employee.id === 'e9')?.hourlyRate).toBe(50);
  });

  it('updates an employee in place (new array)', async () => {
    flushSeed();
    service.setActiveClient('acme');
    service.updateEmployee({
      id: 'e1', name: 'E1 Renamed', province: 'ON', startDate: '2025-01-01', endDate: null,
      confirmedSalary: 120000, expectedSalary: 60000, isSpecialEmployee: false, teamId: 't1',
    });
    const employees = await firstValueFrom(service.employees$);
    const e1 = employees.find((e) => e.employee.id === 'e1');
    expect(e1?.employee.name).toBe('E1 Renamed');
    expect(e1?.hourlyRate).toBe(60); // 120000 / 2000
  });

  it('removes an employee and their timesheet hours from totals', async () => {
    flushSeed();
    service.setActiveClient('acme');
    service.setPeriod('Q1');
    service.removeEmployee('e1'); // e1 had 100h on SRED in Q1
    const employees = await firstValueFrom(service.employees$);
    expect(employees.find((e) => e.employee.id === 'e1')).toBeUndefined();
    const totals = await firstValueFrom(service.grandTotals$);
    // e1's 100h and $3000 labor gone; only the Q1 vendor invoice ($1000) remains
    expect(totals.totalHours).toBe(0);
    expect(totals.totalAmount).toBe(1000);
  });
});
