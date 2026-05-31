import { ClientWorkspace } from '../models';
import {
  buildEmployeeDetail,
  buildGrandTotals,
  buildProjection,
  buildProjectSummaries,
  effectiveSalary,
  fractionElapsed,
  hourlyRate,
  invoiceInPeriod,
  periodHours,
  quarterOfDate,
} from './derivations';

/** Minimal workspace reproducing the PDF worked example:
 *  Person A 10h @ $100, B 20h @ $20, C 50h @ $10 → 80h, $1,900. */
function workedExampleWorkspace(asOfDate = '2025-12-31'): ClientWorkspace {
  return {
    client: {
      id: 'wx',
      name: 'Worked Example',
      loggedInUser: 'x',
      timeZone: 'EST',
      fiscalYearStart: '2025-01-01',
      fiscalYearEnd: '2025-12-31',
      asOfDate,
      standardAnnualHours: 2000, // salary / 2000 → hourly rate
      sredCreditRate: 0.5,
    },
    teams: [],
    employees: [
      { id: 'a', name: 'A', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: 200000, expectedSalary: null, isSpecialEmployee: false, teamId: null }, // $100/h
      { id: 'b', name: 'B', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: 40000, expectedSalary: null, isSpecialEmployee: false, teamId: null }, // $20/h
      { id: 'c', name: 'C', province: 'ON', startDate: '2025-01-01', endDate: null, confirmedSalary: 20000, expectedSalary: null, isSpecialEmployee: false, teamId: null }, // $10/h
    ],
    projects: [{ id: 'p', name: 'Project', color: '#000', isSred: true }],
    timesheets: [
      { employeeId: 'a', projectId: 'p', hours: { q1: 10, q2: 0, q3: 0, q4: 0 } },
      { employeeId: 'b', projectId: 'p', hours: { q1: 20, q2: 0, q3: 0, q4: 0 } },
      { employeeId: 'c', projectId: 'p', hours: { q1: 50, q2: 0, q3: 0, q4: 0 } },
    ],
    vendorInvoices: [],
    governmentAssistanceTotal: 0,
  };
}

describe('derivations — salary & hourly rate', () => {
  const std = 2000;
  it('effectiveSalary prefers confirmed over expected', () => {
    expect(effectiveSalary({ confirmedSalary: 90000, expectedSalary: 80000 } as any)).toBe(90000);
    expect(effectiveSalary({ confirmedSalary: null, expectedSalary: 60000 } as any)).toBe(60000);
    expect(effectiveSalary({ confirmedSalary: null, expectedSalary: null } as any)).toBeNull();
  });

  it('hourlyRate divides effective salary by standard annual hours', () => {
    expect(hourlyRate({ confirmedSalary: null, expectedSalary: 60000 } as any, std)).toBe(30);
    expect(hourlyRate({ confirmedSalary: 90000, expectedSalary: 80000 } as any, std)).toBe(45);
    expect(hourlyRate({ confirmedSalary: null, expectedSalary: 48060 } as any, std)).toBeCloseTo(24.03, 2);
    expect(hourlyRate({ confirmedSalary: null, expectedSalary: null } as any, std)).toBe(0);
  });
});

describe('derivations — period math', () => {
  const h = { q1: 100, q2: 200, q3: 300, q4: 400 };
  it('sums the right quarters per period', () => {
    expect(periodHours(h, 'Q1')).toBe(100);
    expect(periodHours(h, 'Q3')).toBe(300);
    expect(periodHours(h, 'H1')).toBe(300);
    expect(periodHours(h, 'H2')).toBe(700);
    expect(periodHours(h, 'FY')).toBe(1000);
  });

  it('maps dates to quarters and filters invoices by period', () => {
    expect(quarterOfDate('2025-02-10')).toBe('q1');
    expect(quarterOfDate('2025-08-01')).toBe('q3');
    const inv = { invoiceDate: '2025-08-01' } as any;
    expect(invoiceInPeriod(inv, 'Q3')).toBeTrue();
    expect(invoiceInPeriod(inv, 'H2')).toBeTrue();
    expect(invoiceInPeriod(inv, 'H1')).toBeFalse();
    expect(invoiceInPeriod(inv, 'FY')).toBeTrue();
  });
});

describe('derivations — PDF worked example (80h, $1,900)', () => {
  it('reproduces the project hours and monetary total', () => {
    const ws = workedExampleWorkspace();
    const [summary] = buildProjectSummaries(ws, 'FY');
    expect(summary.hours).toBe(80);
    expect(summary.amount).toBe(1900);
    expect(summary.laborAmount).toBe(1900);
    expect(summary.vendorAmount).toBe(0);
  });

  it('grand totals equal the sum of project totals', () => {
    const ws = workedExampleWorkspace();
    const summaries = buildProjectSummaries(ws, 'FY');
    const totals = buildGrandTotals(summaries);
    expect(totals.totalHours).toBe(80);
    expect(totals.totalAmount).toBe(1900);
  });
});

describe('derivations — projection (linear run-rate)', () => {
  it('fractionElapsed is ~0.5 at mid-year', () => {
    const ws = workedExampleWorkspace('2025-07-02');
    expect(fractionElapsed(ws.client)).toBeCloseTo(0.5, 2);
  });

  it('projects full year as ytd / fractionElapsed, and projected × fraction ≈ ytd', () => {
    const ws = workedExampleWorkspace('2025-07-02');
    const p = buildProjection(ws);
    expect(p.ytdHours).toBe(80);
    expect(p.projectedHours).toBeCloseTo(160, 5);
    expect(p.projectedHours * p.fractionElapsed).toBeCloseTo(p.ytdHours, 5);
    expect(p.remainingHours).toBeCloseTo(80, 5);
  });
});

describe('derivations — employee detail', () => {
  it('computes SR&ED allocation = sredHours / totalHours', () => {
    const ws = workedExampleWorkspace();
    const detail = buildEmployeeDetail(ws, 'a', 'FY');
    expect(detail).not.toBeNull();
    expect(detail!.sredHours).toBe(10);
    expect(detail!.unclaimedHours).toBe(0);
    expect(detail!.sredAllocation).toBe(1);
  });

  it('returns null for an unknown employee', () => {
    expect(buildEmployeeDetail(workedExampleWorkspace(), 'nope', 'FY')).toBeNull();
  });
});
