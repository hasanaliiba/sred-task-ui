import { Employee } from './employee.model';
import { Team } from './team.model';

/**
 * Computed view-models produced by the pure derivation functions (core/derivations.ts)
 * and exposed by DashboardDataService. These are NEVER stored — always derived from
 * the raw workspace data for the selected period.
 */

/** Per-project totals for the selected period (Req 4 & 5). */
export interface ProjectSummary {
  projectId: string;
  name: string;
  color: string;
  isSred: boolean;
  hours: number; // labor hours only
  laborAmount: number; // Σ periodHours × hourlyRate
  vendorAmount: number; // Σ in-period invoices on this project
  sredVendorAmount: number; // Σ in-period SR&ED-flagged invoices on this project
  amount: number; // laborAmount + vendorAmount
}

/** Grand totals across all projects (Req 5). */
export interface GrandTotals {
  totalHours: number;
  totalLaborAmount: number;
  totalVendorAmount: number;
  totalAmount: number;
}

/** An employee enriched with derived compensation + resolved team (Req 3). */
export interface EmployeeRow {
  employee: Employee;
  effectiveSalary: number | null; // confirmedSalary ?? expectedSalary
  hourlyRate: number; // effectiveSalary / standardAnnualHours
  team: Team | null;
}

/** SR&ED-vs-Unclaimed hours for one entity (Feature H). */
export interface HoursSplit {
  id: string;
  name: string;
  sredHours: number;
  unclaimedHours: number;
  totalHours: number;
}

/** Per-employee SR&ED hours and SR&ED labor cost for a period (cost = SR&ED hours × hourly rate). */
export interface EmployeeCost {
  id: string;
  name: string;
  hours: number; // SR&ED-eligible hours only
  hourlyRate: number;
  amount: number; // hours × hourlyRate
}

/** Per-team SR&ED hours and SR&ED labor cost for a period (members' costs aggregated). */
export interface TeamCost {
  teamId: string | null; // null = the "Unassigned" group
  teamName: string;
  color: string;
  sredHours: number; // SR&ED-eligible hours only
  sredCost: number; // Σ members' (SR&ED hours × hourly rate)
}

/** A team's members and aggregated hours split (Feature D & H). */
export interface TeamHoursBreakdown {
  teamId: string | null; // null = the "Unassigned" group
  teamName: string;
  color: string;
  members: HoursSplit[];
  teamSredHours: number;
  teamUnclaimedHours: number;
}

/** One project line within an employee's detail modal. */
export interface EmployeeProjectHours {
  projectId: string;
  name: string;
  color: string;
  isSred: boolean;
  hours: number;
}

/** The per-employee breakdown shown in the detail modal (Feature C). */
export interface EmployeeDetail {
  employee: Employee;
  perProject: EmployeeProjectHours[];
  sredHours: number;
  unclaimedHours: number;
  totalHours: number;
  sredAllocation: number; // sredHours / totalHours (0 when no hours)
  hourlyRate: number;
  sredCost: number; // sredHours × hourlyRate
  totalCost: number; // totalHours × hourlyRate
  credit: number; // sredCost × client.sredCreditRate
}

/** SR&ED expenditure + credit for the selected period (Feature E). */
export interface ExpenditureSummary {
  sredLabor: number;
  nonSredLabor: number;
  sredVendor: number;
  totalSredExpenditure: number; // sredLabor + sredVendor
  governmentAssistance: number; // annual figure
  creditableBase: number; // max(0, totalSredExpenditure − governmentAssistance)
  creditAmount: number; // creditableBase × sredCreditRate
}

/** Full-year projection via linear run-rate from fiscalYearStart to asOfDate (Req 6). */
export interface Projection {
  fractionElapsed: number; // 0..1 — share of the fiscal year elapsed at asOfDate
  ytdHours: number;
  projectedHours: number;
  remainingHours: number;
  ytdAmount: number;
  projectedAmount: number;
  remainingAmount: number;
  ytdCredit: number;
  projectedCredit: number;
}
