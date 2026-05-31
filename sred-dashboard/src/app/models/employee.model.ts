/**
 * An employee on a client's payroll (Req 3, Features C & D).
 *
 * Salary is stored as two optional figures; the *effective* salary used for the
 * hourly rate is `confirmedSalary ?? expectedSalary`, and
 * `hourlyRate = effectiveSalary / client.standardAnnualHours`. Both `effectiveSalary`
 * and `hourlyRate` are DERIVED in the service — never stored on the model.
 */
export interface Employee {
  id: string;
  name: string;
  province: string; // "ON" | "BC" | "QC" | "AB" ...
  startDate: string; // ISO
  endDate: string | null;
  confirmedSalary: number | null; // "Confirmed Salary per Payroll" — preferred if present
  expectedSalary: number | null; // "Expected Salary" — fallback when no confirmed salary
  isSpecialEmployee: boolean; // "Specified Employee" flag
  teamId: string | null; // null = not assigned to a team
}
