import { ClientWorkspace, MonthlyHours } from '../models';
import {
  buildEmployeeCostBreakdown,
  buildEmployeeDetail,
  buildGrandTotals,
  buildProjection,
  buildProjectContributors,
  buildProjectSummaries,
  buildTeamCostBreakdown,
  buildTeamDetail,
  effectiveSalary,
  fractionElapsed,
  hourlyRate,
  invoiceInPeriod,
  monthsOf,
  periodHours,
  periodMetricTotal,
  projectMetricValue,
  quarterOfDate,
  sredExpenditure,
} from './derivations';
import { ProjectSummary } from '../models';

/** Build MonthlyHours from a partial (unset months default to 0). */
const months = (over: Partial<MonthlyHours>): MonthlyHours => ({
  m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0, m8: 0, m9: 0, m10: 0, m11: 0, m12: 0, ...over,
});

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
      { employeeId: 'a', projectId: 'p', hours: months({ m1: 10 }) },
      { employeeId: 'b', projectId: 'p', hours: months({ m1: 20 }) },
      { employeeId: 'c', projectId: 'p', hours: months({ m1: 50 }) },
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
  // One value per quarter (in its first month) so quarter totals are 100/200/300/400.
  const h = months({ m1: 100, m4: 200, m7: 300, m10: 400 });
  it('sums the right months per period', () => {
    expect(periodHours(h, 'Q1')).toBe(100);
    expect(periodHours(h, 'Q3')).toBe(300);
    expect(periodHours(h, 'H1')).toBe(300);
    expect(periodHours(h, 'H2')).toBe(700);
    expect(periodHours(h, 'FY')).toBe(1000);
  });

  it('resolves individual month periods (M1..M12)', () => {
    expect(periodHours(h, 'M1')).toBe(100);
    expect(periodHours(h, 'M2')).toBe(0);
    expect(periodHours(h, 'M4')).toBe(200);
    expect(periodHours(h, 'M10')).toBe(400);
  });

  it('resolves a custom month range (inclusive, order-independent, clamped)', () => {
    expect(monthsOf({ from: 2, to: 4 })).toEqual(['m2', 'm3', 'm4']);
    expect(monthsOf({ from: 5, to: 5 })).toEqual(['m5']);
    expect(monthsOf({ from: 6, to: 2 })).toEqual(['m2', 'm3', 'm4', 'm5', 'm6']); // swapped ends
    expect(monthsOf({ from: 0, to: 99 }).length).toBe(12); // clamped to 1..12
    expect(monthsOf('Q2')).toEqual(['m4', 'm5', 'm6']); // named periods still work
  });

  it('sums a custom range via periodHours and filters invoices by it', () => {
    expect(periodHours(h, { from: 1, to: 4 })).toBe(300); // m1 (100) + m4 (200)
    const inv = { invoiceDate: '2025-08-01' } as any; // August → m8
    expect(invoiceInPeriod(inv, { from: 7, to: 9 })).toBeTrue();
    expect(invoiceInPeriod(inv, { from: 1, to: 6 })).toBeFalse();
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

describe('derivations — projection (period-scaled run-rate, SR&ED-only)', () => {
  // Worked example: 80 SR&ED hours, $1,900 labor — all in m1 (Q1).
  it('fractionElapsed (utility) is ~0.5 at mid-year', () => {
    const ws = workedExampleWorkspace('2025-07-02');
    expect(fractionElapsed(ws.client)).toBeCloseTo(0.5, 2);
  });

  it('scales the period to a full year by its share of the year', () => {
    const ws = workedExampleWorkspace();
    // Q1 = 3/12 = 25% → project ×4.
    const q1 = buildProjection(ws, 'Q1');
    expect(q1.fractionElapsed).toBeCloseTo(0.25, 5);
    expect(q1.ytdHours).toBe(80);
    expect(q1.projectedHours).toBeCloseTo(320, 5);
    expect(q1.ytdAmount).toBe(1900);
    expect(q1.projectedAmount).toBeCloseTo(7600, 5);
    // FY = 100% → projected = ytd (no extrapolation).
    const fy = buildProjection(ws, 'FY');
    expect(fy.fractionElapsed).toBe(1);
    expect(fy.ytdHours).toBe(80);
    expect(fy.projectedHours).toBe(80);
    // Q2 has no hours.
    expect(buildProjection(ws, 'Q2').ytdHours).toBe(0);
  });

  it('is SR&ED-only: unclaimed hours and labor are excluded from the projection', () => {
    const ws = workedExampleWorkspace();
    // Add an Unclaimed project with 90h by employee A ($100/h) — must NOT appear in the projection.
    ws.projects.push({ id: 'unc', name: 'Unclaimed', color: '#999', isSred: false });
    ws.timesheets.push({ employeeId: 'a', projectId: 'unc', hours: months({ m1: 90 }) });
    const q1 = buildProjection(ws, 'Q1');
    expect(q1.ytdHours).toBe(80); // still only the 80 SR&ED hours (not 170)
    expect(q1.ytdAmount).toBe(1900); // SR&ED labor only (the 90h × $100 unclaimed is excluded)
  });
});

describe('derivations — employee cost breakdown (SR&ED only)', () => {
  it('computes SR&ED cost as SR&ED hours × the employee hourly rate', () => {
    const ws = workedExampleWorkspace(); // project 'p' is SR&ED; A: 10h@$100, B: 20h@$20, C: 50h@$10
    const rows = buildEmployeeCostBreakdown(ws, 'FY');
    const a = rows.find((r) => r.id === 'a')!;
    expect(a.hours).toBe(10);
    expect(a.hourlyRate).toBe(100);
    expect(a.amount).toBe(1000); // 10 × 100
    expect(rows.find((r) => r.id === 'b')!.amount).toBe(400); // 20 × 20
    expect(rows.find((r) => r.id === 'c')!.amount).toBe(500); // 50 × 10
  });

  it('excludes hours logged on non-SR&ED (Unclaimed) projects', () => {
    const ws = workedExampleWorkspace();
    // Give employee 'a' 90h on a new Unclaimed project — must NOT be counted.
    ws.projects.push({ id: 'unc', name: 'Unclaimed', color: '#999', isSred: false });
    ws.timesheets.push({ employeeId: 'a', projectId: 'unc', hours: months({ m1: 90 }) });
    const a = buildEmployeeCostBreakdown(ws, 'FY').find((r) => r.id === 'a')!;
    expect(a.hours).toBe(10); // still only the SR&ED hours
    expect(a.amount).toBe(1000); // unchanged
  });
});

describe('derivations — project metric value', () => {
  const sred: ProjectSummary = { projectId: 'p', name: 'P', color: '#000', isSred: true, hours: 80, laborAmount: 1900, vendorAmount: 200, sredVendorAmount: 200, amount: 2100 };
  it('returns hours / expenditure / credit per the metric', () => {
    expect(projectMetricValue(sred, 'hours', 0.5)).toBe(80);
    expect(projectMetricValue(sred, 'expenditure', 0.5)).toBe(2100);
    expect(projectMetricValue(sred, 'credit', 0.5)).toBe((1900 + 200) * 0.5); // 1050
  });
  it('a non-SR&ED project contributes no labor credit', () => {
    const unc: ProjectSummary = { projectId: 'u', name: 'U', color: '#000', isSred: false, hours: 50, laborAmount: 1000, vendorAmount: 0, sredVendorAmount: 0, amount: 1000 };
    expect(projectMetricValue(unc, 'credit', 0.5)).toBe(0);
  });

  it('expenditure excludes non-SR&ED vendor invoices (labor + SR&ED vendor only)', () => {
    // labor 1000, vendor 500 of which only 200 is SR&ED → 300 non-SR&ED vendor excluded.
    const p: ProjectSummary = { projectId: 'p', name: 'P', color: '#000', isSred: true, hours: 40, laborAmount: 1000, vendorAmount: 500, sredVendorAmount: 200, amount: 1500 };
    expect(sredExpenditure(p)).toBe(1200); // 1000 + 200 (not 1500)
    expect(projectMetricValue(p, 'expenditure', 0.5)).toBe(1200);
    // `amount` (the blue strip's value) still includes all vendor.
    expect(p.amount).toBe(1500);
  });
});

describe('derivations — period metric total (drives the tiles)', () => {
  // Worked example: 80h all in m1 (so Q1 = M1 = 80, other periods = 0), $1,900 labor, SR&ED, rate 0.5.
  it('totals hours / expenditure / credit for a period', () => {
    const ws = workedExampleWorkspace();
    expect(periodMetricTotal(ws, 'FY', 'hours')).toBe(80);
    expect(periodMetricTotal(ws, 'Q1', 'hours')).toBe(80);
    expect(periodMetricTotal(ws, 'M1', 'hours')).toBe(80);
    expect(periodMetricTotal(ws, 'Q2', 'hours')).toBe(0);
    expect(periodMetricTotal(ws, 'FY', 'expenditure')).toBe(1900);
    expect(periodMetricTotal(ws, 'FY', 'credit')).toBe(950); // 1900 × 0.5
  });

  it('is SR&ED-only: unclaimed hours and labor are excluded from the tiles', () => {
    const ws = workedExampleWorkspace();
    // 90h on an Unclaimed project (employee A @ $100/h) — must NOT inflate the tiles.
    ws.projects.push({ id: 'unc', name: 'Unclaimed', color: '#999', isSred: false });
    ws.timesheets.push({ employeeId: 'a', projectId: 'unc', hours: months({ m1: 90 }) });
    expect(periodMetricTotal(ws, 'FY', 'hours')).toBe(80); // not 170
    expect(periodMetricTotal(ws, 'FY', 'expenditure')).toBe(1900); // unclaimed $9,000 labor excluded
    expect(periodMetricTotal(ws, 'FY', 'credit')).toBe(950);
  });

  it('credit total mirrors the per-project credit sum (no government-assistance offset)', () => {
    const ws = workedExampleWorkspace();
    const summaries = buildProjectSummaries(ws, 'FY');
    const byHand = summaries.reduce((s, p) => s + projectMetricValue(p, 'credit', ws.client.sredCreditRate), 0);
    expect(periodMetricTotal(ws, 'FY', 'credit')).toBe(byHand);
  });
});

describe('derivations — team cost breakdown', () => {
  it('aggregates SR&ED hours and cost per team, with an Unassigned group', () => {
    const ws = workedExampleWorkspace(); // A 10h@$100, B 20h@$20, C 50h@$10 on SR&ED project 'p'
    ws.teams = [{ id: 'tm', name: 'Team', color: '#000' }];
    ws.employees[0].teamId = 'tm'; // A → team
    ws.employees[1].teamId = 'tm'; // B → team
    // C stays unassigned (teamId null)

    const rows = buildTeamCostBreakdown(ws, 'FY');
    const team = rows.find((r) => r.teamId === 'tm')!;
    expect(team.sredHours).toBe(30); // 10 + 20
    expect(team.sredCost).toBe(1400); // 1000 + 400

    const unassigned = rows.find((r) => r.teamId === null)!;
    expect(unassigned.sredHours).toBe(50);
    expect(unassigned.sredCost).toBe(500);
  });
});

describe('derivations — project contributors (modal)', () => {
  it('lists each employee’s hours on a project, desc, with their team', () => {
    const ws = workedExampleWorkspace(); // A 10h, B 20h, C 50h all on project 'p'
    ws.teams = [{ id: 'tm', name: 'Team', color: '#000' }];
    ws.employees[0].teamId = 'tm'; // A on a team

    const rows = buildProjectContributors(ws, 'p', 'FY');
    expect(rows.map((r) => r.hours)).toEqual([50, 20, 10]); // sorted desc (C, B, A)
    expect(rows[0].name).toBe('C');
    const a = rows.find((r) => r.employeeId === 'a')!;
    expect(a.teamName).toBe('Team');
    expect(rows.find((r) => r.employeeId === 'b')!.teamName).toBeNull();

    // Rate + cost: A 10h @ $100 = $1,000; B 20h @ $20 = $400; C 50h @ $10 = $500.
    expect(a.hourlyRate).toBe(100);
    expect(a.cost).toBe(1000);
    const c = rows.find((r) => r.employeeId === 'c')!;
    expect(c.hourlyRate).toBe(10);
    expect(c.cost).toBe(500);
  });
});

describe('derivations — team detail (modal)', () => {
  it('aggregates a team’s hours, cost, and credit (null = Unassigned)', () => {
    const ws = workedExampleWorkspace(); // A 10h@$100, B 20h@$20, C 50h@$10 on SR&ED project 'p'
    ws.teams = [{ id: 'tm', name: 'Team', color: '#000' }];
    ws.employees[0].teamId = 'tm';
    ws.employees[1].teamId = 'tm';

    const tm = buildTeamDetail(ws, 'tm', 'FY')!;
    expect(tm.sredHours).toBe(30); // 10 + 20
    expect(tm.totalHours).toBe(30); // all SR&ED here
    expect(tm.sredCost).toBe(1400); // 1000 + 400
    expect(tm.credit).toBe(700); // 1400 × 0.5
    expect(tm.sredAllocation).toBe(1);
    // A + B both on project 'p' → one project line, hours summed.
    expect(tm.perProject.length).toBe(1);
    expect(tm.perProject[0].projectId).toBe('p');
    expect(tm.perProject[0].hours).toBe(30);

    const unassigned = buildTeamDetail(ws, null, 'FY')!; // C only
    expect(unassigned.teamName).toBe('Unassigned');
    expect(unassigned.sredCost).toBe(500);
    expect(unassigned.credit).toBe(250);

    expect(buildTeamDetail(ws, 'nope', 'FY')).toBeNull();
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
    // A: 10 SR&ED hours @ $100/h → cost $1,000; credit = 1000 × 0.5 = $500.
    expect(detail!.hourlyRate).toBe(100);
    expect(detail!.sredCost).toBe(1000);
    expect(detail!.totalCost).toBe(1000);
    expect(detail!.credit).toBe(500);
  });

  it('returns null for an unknown employee', () => {
    expect(buildEmployeeDetail(workedExampleWorkspace(), 'nope', 'FY')).toBeNull();
  });
});
