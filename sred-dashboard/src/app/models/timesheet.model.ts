import { MonthlyHours } from './period.model';

/**
 * Hours an employee logged against a project, split by month (Req 4 & 5).
 * One row per (employee, project). The monetary amount is DERIVED:
 * periodHours × the employee's hourly rate.
 */
export interface TimesheetEntry {
  employeeId: string;
  projectId: string;
  hours: MonthlyHours; // m1..m12 actuals; period totals derived
}
