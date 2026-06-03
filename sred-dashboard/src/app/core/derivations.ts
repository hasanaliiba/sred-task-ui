import type {
  Client,
  ClientWorkspace,
  Employee,
  Metric,
  MonthlyHours,
  NamedPeriod,
  Period,
  Project,
  TimesheetEntry,
  VendorInvoice,
} from '../models';
import type {
  EmployeeCost,
  EmployeeDetail,
  EmployeeProjectHours,
  EmployeeRow,
  ProjectContributor,
  ProjectEmployeeStacks,
  ExpenditureSummary,
  GrandTotals,
  HoursSplit,
  ProjectSummary,
  Projection,
  TeamCost,
  TeamDetail,
  TeamMemberDetail,
  TeamHoursBreakdown,
} from '../models';

/**
 * Pure derivation layer. Every function here is a pure function of its inputs —
 * no side effects, no mutation — so the dashboard's numbers are deterministic
 * and unit-testable in isolation (rules.md: pure functions, immutability).
 */

type QuarterKey = 'q1' | 'q2' | 'q3' | 'q4';
type MonthKey = keyof MonthlyHours;

const M = (...n: number[]): MonthKey[] => n.map((i) => `m${i}` as MonthKey);

/** Which months make up each NAMED period (months drive everything; quarters = groups of 3). */
const MONTHS_IN_PERIOD: Record<NamedPeriod, MonthKey[]> = {
  Q1: M(1, 2, 3),
  Q2: M(4, 5, 6),
  Q3: M(7, 8, 9),
  Q4: M(10, 11, 12),
  H1: M(1, 2, 3, 4, 5, 6),
  H2: M(7, 8, 9, 10, 11, 12),
  FY: M(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
  // Individual months (each resolves to its single month) — drive the by-month tiles.
  M1: M(1), M2: M(2), M3: M(3), M4: M(4), M5: M(5), M6: M(6),
  M7: M(7), M8: M(8), M9: M(9), M10: M(10), M11: M(11), M12: M(12),
};

/** Salary actually used for the hourly rate: confirmed takes precedence over expected. */
export function effectiveSalary(employee: Employee): number | null {
  return employee.confirmedSalary ?? employee.expectedSalary;
}

/** Equivalent hourly rate = effective salary / standard annual hours. */
export function hourlyRate(employee: Employee, standardAnnualHours: number): number {
  const salary = effectiveSalary(employee);
  if (salary === null || standardAnnualHours <= 0) {
    return 0;
  }
  return salary / standardAnnualHours;
}

/**
 * The set of months a period covers. Named periods use the fixed table; a custom
 * range expands to its inclusive months (order-independent, clamped to 1..12).
 * This is the single place period selection turns into months.
 */
export function monthsOf(period: Period): MonthKey[] {
  if (typeof period === 'string') {
    return MONTHS_IN_PERIOD[period];
  }
  const lo = Math.max(1, Math.min(period.from, period.to));
  const hi = Math.min(12, Math.max(period.from, period.to));
  return M(...Array.from({ length: hi - lo + 1 }, (_, i) => lo + i));
}

/** Hours within the selected period (sum of the period's months). */
export function periodHours(hours: MonthlyHours, period: Period): number {
  return monthsOf(period).reduce((sum, m) => sum + hours[m], 0);
}

/** Map an ISO date to its fiscal quarter key (calendar quarters). */
export function quarterOfDate(isoDate: string): QuarterKey {
  const month = new Date(isoDate).getUTCMonth(); // 0..11
  if (month <= 2) return 'q1';
  if (month <= 5) return 'q2';
  if (month <= 8) return 'q3';
  return 'q4';
}

/** Map an ISO date to its month key (m1..m12). */
export function monthOfDate(isoDate: string): MonthKey {
  return `m${new Date(isoDate).getUTCMonth() + 1}` as MonthKey;
}

/** Whether an invoice (by its date's month) falls within the selected period. */
export function invoiceInPeriod(invoice: VendorInvoice, period: Period): boolean {
  return monthsOf(period).includes(monthOfDate(invoice.invoiceDate));
}

/** Share of the fiscal year elapsed at asOfDate, clamped to (0, 1]. */
export function fractionElapsed(client: Client): number {
  const start = Date.parse(client.fiscalYearStart);
  const end = Date.parse(client.fiscalYearEnd);
  const asOf = Date.parse(client.asOfDate);
  if (!(end > start)) {
    return 1;
  }
  const raw = (asOf - start) / (end - start);
  // Clamp: never 0 (avoids division by zero in projections), never above 1.
  return Math.min(1, Math.max(1e-6, raw));
}

/** Build a fast id→employee lookup for a workspace. */
function employeeMap(ws: ClientWorkspace): Map<string, Employee> {
  return new Map(ws.employees.map((e) => [e.id, e]));
}

/** Monetary value of a single timesheet entry for the period. */
export function entryAmount(
  entry: TimesheetEntry,
  employee: Employee,
  standardAnnualHours: number,
  period: Period,
): number {
  return periodHours(entry.hours, period) * hourlyRate(employee, standardAnnualHours);
}

/** Per-project hours and dollar totals for the selected period (Req 4 & 5). */
export function buildProjectSummaries(ws: ClientWorkspace, period: Period): ProjectSummary[] {
  const emps = employeeMap(ws);
  const std = ws.client.standardAnnualHours;

  return ws.projects.map((project: Project) => {
    const entries = ws.timesheets.filter((t) => t.projectId === project.id);
    const hours = entries.reduce((sum, t) => sum + periodHours(t.hours, period), 0);
    const laborAmount = entries.reduce((sum, t) => {
      const emp = emps.get(t.employeeId);
      return emp ? sum + entryAmount(t, emp, std, period) : sum;
    }, 0);
    const inPeriodInvoices = ws.vendorInvoices.filter(
      (v) => v.projectId === project.id && invoiceInPeriod(v, period),
    );
    const vendorAmount = inPeriodInvoices.reduce((sum, v) => sum + v.amount, 0);
    const sredVendorAmount = inPeriodInvoices.filter((v) => v.isSred).reduce((sum, v) => sum + v.amount, 0);

    return {
      projectId: project.id,
      name: project.name,
      color: project.color,
      isSred: project.isSred,
      hours,
      laborAmount,
      vendorAmount,
      sredVendorAmount,
      amount: laborAmount + vendorAmount,
    };
  });
}

/**
 * Expenditure counted in the SR&ED-focused views: labor (all) + **SR&ED-flagged vendor
 * only**. Non-SR&ED vendor invoices are excluded everywhere this is used (donut, tiles,
 * project chart/grid/modal, projection). The blue grand-totals strip is the only place
 * that still shows the true total — `ProjectSummary.amount` (labor + ALL vendor).
 */
export function sredExpenditure(summary: ProjectSummary): number {
  return summary.laborAmount + summary.sredVendorAmount;
}

/** The value of a project under the active metric (hours / $ expenditure / SR&ED credit). */
export function projectMetricValue(summary: ProjectSummary, metric: Metric, creditRate: number): number {
  switch (metric) {
    case 'hours':
      return summary.hours;
    case 'expenditure':
      return sredExpenditure(summary);
    case 'credit': {
      const sredLabor = summary.isSred ? summary.laborAmount : 0;
      return (sredLabor + summary.sredVendorAmount) * creditRate;
    }
  }
}

/**
 * Total of the active metric for a period, across all projects (drives the summary tiles).
 * Credit mirrors the cost-share donut: sum of per-project SR&ED credit (government
 * assistance is an annual figure, so it is intentionally not subtracted per-period here).
 */
export function periodMetricTotal(ws: ClientWorkspace, period: Period, metric: Metric): number {
  // SR&ED-only across all three metrics — unclaimed projects (hours + labor) are excluded,
  // so the tiles reconcile with the SR&ED projection and credit (only the blue strip, now
  // removed, ever showed unclaimed totals).
  const summaries = buildProjectSummaries(ws, period).filter((s) => s.isSred);
  switch (metric) {
    case 'hours':
      return summaries.reduce((sum, s) => sum + s.hours, 0);
    case 'expenditure':
      return summaries.reduce((sum, s) => sum + sredExpenditure(s), 0);
    case 'credit': {
      const rate = ws.client.sredCreditRate;
      return summaries.reduce((sum, s) => sum + projectMetricValue(s, 'credit', rate), 0);
    }
  }
}

/** Who worked on a project: each employee's hours on it (+ their team), desc by hours. */
export function buildProjectContributors(
  ws: ClientWorkspace,
  projectId: string,
  period: Period,
): ProjectContributor[] {
  const emps = employeeMap(ws);
  const std = ws.client.standardAnnualHours;
  const teamNames = new Map(ws.teams.map((t) => [t.id, t.name]));
  const byEmployee = new Map<string, number>();
  for (const t of ws.timesheets.filter((t) => t.projectId === projectId)) {
    byEmployee.set(t.employeeId, (byEmployee.get(t.employeeId) ?? 0) + periodHours(t.hours, period));
  }
  return [...byEmployee.entries()]
    .map(([employeeId, hours]) => {
      const e = emps.get(employeeId);
      const rate = e ? hourlyRate(e, std) : 0;
      return {
        employeeId,
        name: e?.name ?? employeeId,
        teamName: e?.teamId ? teamNames.get(e.teamId) ?? null : null,
        hours,
        hourlyRate: rate,
        cost: hours * rate,
      };
    })
    .filter((c) => c.hours > 0)
    .sort((a, b) => b.hours - a.hours);
}

/**
 * Per-project employee-hour stacks (Req 4 chart). One column per project, stacked by
 * employee (hours); `amounts` mirrors `hours` as labor cost. Only employees with logged
 * hours in the period become series; project totals are the column sums.
 */
export function buildProjectEmployeeStacks(ws: ClientWorkspace, period: Period): ProjectEmployeeStacks {
  const std = ws.client.standardAnnualHours;
  const emps = employeeMap(ws);
  const projects = ws.projects.map((p) => ({ id: p.id, name: p.name }));
  const projIndex = new Map(projects.map((p, i) => [p.id, i]));

  // employeeId → hours per project index (only positive entries)
  const rows = new Map<string, number[]>();
  for (const t of ws.timesheets) {
    const j = projIndex.get(t.projectId);
    if (j === undefined || !emps.has(t.employeeId)) continue;
    const h = periodHours(t.hours, period);
    if (h <= 0) continue;
    if (!rows.has(t.employeeId)) rows.set(t.employeeId, projects.map(() => 0));
    rows.get(t.employeeId)![j] += h;
  }

  const empIds = [...rows.keys()].sort((a, b) =>
    (emps.get(a)?.name ?? '').localeCompare(emps.get(b)?.name ?? ''),
  );
  const employees: string[] = [];
  const hours: number[][] = [];
  const amounts: number[][] = [];
  for (const id of empIds) {
    const e = emps.get(id)!;
    const rate = hourlyRate(e, std);
    const hrow = rows.get(id)!;
    employees.push(e.name);
    hours.push(hrow);
    amounts.push(hrow.map((h) => h * rate));
  }

  const projOut = projects.map((p, j) => ({
    id: p.id,
    name: p.name,
    totalHours: hours.reduce((sum, r) => sum + r[j], 0),
    totalAmount: amounts.reduce((sum, r) => sum + r[j], 0),
  }));

  return { projects: projOut, employees, hours, amounts };
}

/** Grand totals across all project summaries (Req 5). */
export function buildGrandTotals(summaries: ProjectSummary[]): GrandTotals {
  return summaries.reduce<GrandTotals>(
    (acc, s) => ({
      totalHours: acc.totalHours + s.hours,
      totalLaborAmount: acc.totalLaborAmount + s.laborAmount,
      totalVendorAmount: acc.totalVendorAmount + s.vendorAmount,
      totalAmount: acc.totalAmount + s.amount,
    }),
    { totalHours: 0, totalLaborAmount: 0, totalVendorAmount: 0, totalAmount: 0 },
  );
}

/** Employees enriched with derived hourly rate and resolved team (Req 3). */
export function buildEmployeeRows(ws: ClientWorkspace): EmployeeRow[] {
  const std = ws.client.standardAnnualHours;
  const teams = new Map(ws.teams.map((t) => [t.id, t]));
  return ws.employees.map((employee) => ({
    employee,
    effectiveSalary: effectiveSalary(employee),
    hourlyRate: hourlyRate(employee, std),
    team: employee.teamId ? teams.get(employee.teamId) ?? null : null,
  }));
}

/** Per-project hours for one employee, split SR&ED vs Unclaimed (used by the detail modal). */
function projectHoursForEmployee(ws: ClientWorkspace, employeeId: string, period: Period) {
  const projects = new Map(ws.projects.map((p) => [p.id, p]));
  return ws.timesheets
    .filter((t) => t.employeeId === employeeId)
    .map((t) => {
      const project = projects.get(t.projectId);
      return {
        projectId: t.projectId,
        name: project?.name ?? t.projectId,
        color: project?.color ?? '#9ca3af',
        isSred: project?.isSred ?? false,
        hours: periodHours(t.hours, period),
      };
    });
}

/** SR&ED-vs-Unclaimed hours per employee for the period (Feature H — employee chart). */
export function buildEmployeeHoursBreakdown(ws: ClientWorkspace, period: Period): HoursSplit[] {
  return ws.employees.map((employee) => splitForEmployee(ws, employee, period));
}

function splitForEmployee(ws: ClientWorkspace, employee: Employee, period: Period): HoursSplit {
  const lines = projectHoursForEmployee(ws, employee.id, period);
  const sredHours = lines.filter((l) => l.isSred).reduce((s, l) => s + l.hours, 0);
  const unclaimedHours = lines.filter((l) => !l.isSred).reduce((s, l) => s + l.hours, 0);
  return {
    id: employee.id,
    name: employee.name,
    sredHours,
    unclaimedHours,
    totalHours: sredHours + unclaimedHours,
  };
}

/**
 * Per-employee SR&ED hours and SR&ED labor cost for the period. Only hours on
 * SR&ED-eligible projects are counted; cost = SR&ED hours × the employee's hourly rate.
 */
export function buildEmployeeCostBreakdown(ws: ClientWorkspace, period: Period): EmployeeCost[] {
  const std = ws.client.standardAnnualHours;
  const sredProjectIds = new Set(ws.projects.filter((p) => p.isSred).map((p) => p.id));
  return ws.employees.map((employee) => {
    const hours = ws.timesheets
      .filter((t) => t.employeeId === employee.id && sredProjectIds.has(t.projectId))
      .reduce((sum, t) => sum + periodHours(t.hours, period), 0);
    const rate = hourlyRate(employee, std);
    return { id: employee.id, name: employee.name, hours, hourlyRate: rate, amount: hours * rate };
  });
}

/** Per-team SR&ED hours + SR&ED labor cost for the period (employee costs grouped by team). */
export function buildTeamCostBreakdown(ws: ClientWorkspace, period: Period): TeamCost[] {
  const costs = buildEmployeeCostBreakdown(ws, period);
  const teamOf = new Map(ws.employees.map((e) => [e.id, e.teamId]));
  const acc = new Map<string | null, { hours: number; cost: number }>();
  for (const c of costs) {
    const teamId = teamOf.get(c.id) ?? null;
    const cur = acc.get(teamId) ?? { hours: 0, cost: 0 };
    acc.set(teamId, { hours: cur.hours + c.hours, cost: cur.cost + c.amount });
  }
  const rows: TeamCost[] = ws.teams.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    color: t.color,
    sredHours: acc.get(t.id)?.hours ?? 0,
    sredCost: acc.get(t.id)?.cost ?? 0,
  }));
  const unassigned = acc.get(null);
  if (unassigned && (unassigned.hours > 0 || unassigned.cost > 0)) {
    rows.push({
      teamId: null,
      teamName: 'Unassigned',
      color: '#9ca3af',
      sredHours: unassigned.hours,
      sredCost: unassigned.cost,
    });
  }
  return rows;
}

/** A single team's aggregated hours + cost + credit for the detail modal (teamId null = Unassigned). */
export function buildTeamDetail(ws: ClientWorkspace, teamId: string | null, period: Period): TeamDetail | null {
  const team = ws.teams.find((t) => t.id === teamId) ?? null;
  if (teamId !== null && !team) {
    return null;
  }
  const std = ws.client.standardAnnualHours;
  const members = ws.employees.filter((e) => e.teamId === teamId);
  let sredHours = 0;
  let unclaimedHours = 0;
  let sredCost = 0;
  let totalCost = 0;
  const perMember: TeamMemberDetail[] = [];
  // Team's hours per project: sum each member's per-project lines into one map.
  const byProject = new Map<string, EmployeeProjectHours>();
  for (const e of members) {
    const split = splitForEmployee(ws, e, period);
    const rate = hourlyRate(e, std);
    sredHours += split.sredHours;
    unclaimedHours += split.unclaimedHours;
    sredCost += split.sredHours * rate;
    totalCost += split.totalHours * rate;
    perMember.push({
      employeeId: e.id,
      name: e.name,
      hourlyRate: rate,
      sredHours: split.sredHours,
      totalHours: split.totalHours,
      sredCost: split.sredHours * rate,
      totalCost: split.totalHours * rate,
    });
    for (const line of projectHoursForEmployee(ws, e.id, period)) {
      const existing = byProject.get(line.projectId);
      if (existing) {
        existing.hours += line.hours;
      } else {
        byProject.set(line.projectId, { ...line });
      }
    }
  }
  const totalHours = sredHours + unclaimedHours;
  return {
    teamId,
    teamName: team?.name ?? 'Unassigned',
    color: team?.color ?? '#9ca3af',
    sredHours,
    unclaimedHours,
    totalHours,
    sredAllocation: totalHours > 0 ? sredHours / totalHours : 0,
    sredCost,
    totalCost,
    credit: sredCost * ws.client.sredCreditRate,
    perProject: [...byProject.values()].filter((l) => l.hours > 0).sort((a, b) => b.hours - a.hours),
    perMember: perMember.filter((m) => m.totalHours > 0).sort((a, b) => b.totalCost - a.totalCost),
  };
}

/** Teams with members and aggregated hours, plus an "Unassigned" group (Feature D & H). */
export function buildTeamHoursBreakdown(ws: ClientWorkspace, period: Period): TeamHoursBreakdown[] {
  const groups: TeamHoursBreakdown[] = ws.teams.map((team) => {
    const members = ws.employees
      .filter((e) => e.teamId === team.id)
      .map((e) => splitForEmployee(ws, e, period));
    return {
      teamId: team.id,
      teamName: team.name,
      color: team.color,
      members,
      teamSredHours: members.reduce((s, m) => s + m.sredHours, 0),
      teamUnclaimedHours: members.reduce((s, m) => s + m.unclaimedHours, 0),
    };
  });

  const unassignedMembers = ws.employees
    .filter((e) => e.teamId === null)
    .map((e) => splitForEmployee(ws, e, period));

  if (unassignedMembers.length > 0) {
    groups.push({
      teamId: null,
      teamName: 'Unassigned',
      color: '#9ca3af',
      members: unassignedMembers,
      teamSredHours: unassignedMembers.reduce((s, m) => s + m.sredHours, 0),
      teamUnclaimedHours: unassignedMembers.reduce((s, m) => s + m.unclaimedHours, 0),
    });
  }

  return groups;
}

/** The full per-employee breakdown for the detail modal (Feature C). */
export function buildEmployeeDetail(
  ws: ClientWorkspace,
  employeeId: string,
  period: Period,
): EmployeeDetail | null {
  const employee = ws.employees.find((e) => e.id === employeeId);
  if (!employee) {
    return null;
  }
  const perProject = projectHoursForEmployee(ws, employeeId, period);
  const sredHours = perProject.filter((p) => p.isSred).reduce((s, p) => s + p.hours, 0);
  const unclaimedHours = perProject.filter((p) => !p.isSred).reduce((s, p) => s + p.hours, 0);
  const totalHours = sredHours + unclaimedHours;
  const rate = hourlyRate(employee, ws.client.standardAnnualHours);
  const sredCost = sredHours * rate;
  return {
    employee,
    perProject,
    sredHours,
    unclaimedHours,
    totalHours,
    sredAllocation: totalHours > 0 ? sredHours / totalHours : 0,
    hourlyRate: rate,
    sredCost,
    totalCost: totalHours * rate,
    credit: sredCost * ws.client.sredCreditRate,
  };
}

/** SR&ED expenditure + credit for the selected period (Feature E). */
export function buildExpenditureSummary(ws: ClientWorkspace, period: Period): ExpenditureSummary {
  const emps = employeeMap(ws);
  const std = ws.client.standardAnnualHours;
  const sredProjectIds = new Set(ws.projects.filter((p) => p.isSred).map((p) => p.id));

  const labor = ws.timesheets.reduce(
    (acc, t) => {
      const emp = emps.get(t.employeeId);
      if (!emp) return acc;
      const amount = entryAmount(t, emp, std, period);
      return sredProjectIds.has(t.projectId)
        ? { sred: acc.sred + amount, nonSred: acc.nonSred }
        : { sred: acc.sred, nonSred: acc.nonSred + amount };
    },
    { sred: 0, nonSred: 0 },
  );

  const sredVendor = ws.vendorInvoices
    .filter((v) => v.isSred && invoiceInPeriod(v, period))
    .reduce((sum, v) => sum + v.amount, 0);

  const totalSredExpenditure = labor.sred + sredVendor;
  const governmentAssistance = ws.governmentAssistanceTotal;
  const creditableBase = Math.max(0, totalSredExpenditure - governmentAssistance);

  return {
    sredLabor: labor.sred,
    nonSredLabor: labor.nonSred,
    sredVendor,
    totalSredExpenditure,
    governmentAssistance,
    creditableBase,
    creditAmount: creditableBase * ws.client.sredCreditRate,
  };
}

/**
 * SR&ED-only run-rate projection for the SELECTED period (Req 6). The period's SR&ED
 * figures are scaled to a full year by the period's share of the year
 * (`monthsOf(period).length / 12` — Q1 → 0.25, H1 → 0.5, FY → 1, a single month → 1/12).
 * Unclaimed hours/labor are excluded entirely.
 */
export function buildProjection(ws: ClientWorkspace, period: Period): Projection {
  const summaries = buildProjectSummaries(ws, period);
  const expenditure = buildExpenditureSummary(ws, period);
  // Hours: only hours on SR&ED projects. Expenditure: SR&ED labor + SR&ED vendor.
  const sredHours = summaries.filter((p) => p.isSred).reduce((sum, p) => sum + p.hours, 0);
  const sredExp = expenditure.totalSredExpenditure;
  const fraction = Math.min(1, monthsOf(period).length / 12);
  const project = (ytd: number) => ytd / fraction;

  return {
    fractionElapsed: fraction,
    ytdHours: sredHours,
    projectedHours: project(sredHours),
    remainingHours: project(sredHours) - sredHours,
    ytdAmount: sredExp,
    projectedAmount: project(sredExp),
    remainingAmount: project(sredExp) - sredExp,
    ytdCredit: expenditure.creditAmount,
    projectedCredit: project(expenditure.creditAmount),
  };
}
