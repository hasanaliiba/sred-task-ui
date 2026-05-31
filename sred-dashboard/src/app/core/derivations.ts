import type {
  Client,
  ClientWorkspace,
  Employee,
  Period,
  Project,
  QuarterlyHours,
  TimesheetEntry,
  VendorInvoice,
} from '../models';
import type {
  EmployeeCost,
  EmployeeDetail,
  EmployeeRow,
  ExpenditureSummary,
  GrandTotals,
  HoursSplit,
  ProjectSummary,
  Projection,
  TeamHoursBreakdown,
} from '../models';

/**
 * Pure derivation layer. Every function here is a pure function of its inputs —
 * no side effects, no mutation — so the dashboard's numbers are deterministic
 * and unit-testable in isolation (rules.md: pure functions, immutability).
 */

type QuarterKey = 'q1' | 'q2' | 'q3' | 'q4';

const QUARTERS_IN_PERIOD: Record<Period, QuarterKey[]> = {
  Q1: ['q1'],
  Q2: ['q2'],
  Q3: ['q3'],
  Q4: ['q4'],
  H1: ['q1', 'q2'],
  H2: ['q3', 'q4'],
  FY: ['q1', 'q2', 'q3', 'q4'],
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

/** Hours within the selected period (Q1–Q4 / H1 / H2 / FY). */
export function periodHours(hours: QuarterlyHours, period: Period): number {
  return QUARTERS_IN_PERIOD[period].reduce((sum, q) => sum + hours[q], 0);
}

/** Map an ISO date to its fiscal quarter key (calendar quarters). */
export function quarterOfDate(isoDate: string): QuarterKey {
  const month = new Date(isoDate).getUTCMonth(); // 0..11
  if (month <= 2) return 'q1';
  if (month <= 5) return 'q2';
  if (month <= 8) return 'q3';
  return 'q4';
}

/** Whether an invoice (by its date's quarter) falls within the selected period. */
export function invoiceInPeriod(invoice: VendorInvoice, period: Period): boolean {
  return QUARTERS_IN_PERIOD[period].includes(quarterOfDate(invoice.invoiceDate));
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
    const vendorAmount = ws.vendorInvoices
      .filter((v) => v.projectId === project.id && invoiceInPeriod(v, period))
      .reduce((sum, v) => sum + v.amount, 0);

    return {
      projectId: project.id,
      name: project.name,
      color: project.color,
      isSred: project.isSred,
      hours,
      laborAmount,
      vendorAmount,
      amount: laborAmount + vendorAmount,
    };
  });
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
  return {
    employee,
    perProject,
    sredHours,
    unclaimedHours,
    totalHours,
    sredAllocation: totalHours > 0 ? sredHours / totalHours : 0,
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

/** Full-year projection via linear run-rate (Req 6). Always FY-based, period-independent. */
export function buildProjection(ws: ClientWorkspace): Projection {
  const fy = buildProjectSummaries(ws, 'FY');
  const totals = buildGrandTotals(fy);
  const expenditure = buildExpenditureSummary(ws, 'FY');
  const fraction = fractionElapsed(ws.client);
  const project = (ytd: number) => ytd / fraction;

  return {
    fractionElapsed: fraction,
    ytdHours: totals.totalHours,
    projectedHours: project(totals.totalHours),
    remainingHours: project(totals.totalHours) - totals.totalHours,
    ytdAmount: totals.totalAmount,
    projectedAmount: project(totals.totalAmount),
    remainingAmount: project(totals.totalAmount) - totals.totalAmount,
    ytdCredit: expenditure.creditAmount,
    projectedCredit: project(expenditure.creditAmount),
  };
}
