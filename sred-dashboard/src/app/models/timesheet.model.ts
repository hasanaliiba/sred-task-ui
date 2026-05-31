import { QuarterlyHours } from './period.model';

/**
 * Hours an employee logged against a project, split by quarter (Req 4 & 5).
 * One row per (employee, project). The monetary amount is DERIVED:
 * periodHours × the employee's hourly rate.
 */
export interface TimesheetEntry {
  employeeId: string;
  projectId: string;
  hours: QuarterlyHours; // q1..q4 actuals; period totals derived
}
