/**
 * A named reporting period (Feature B).
 * Q1–Q4 are individual quarters; H1 = Q1+Q2, H2 = Q3+Q4, FY = full year;
 * M1–M12 are individual calendar months (P2.5, for the by-month tiles).
 * Each named period maps to a fixed set of months in MONTHS_IN_PERIOD.
 */
export type NamedPeriod =
  | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  | 'H1' | 'H2' | 'FY'
  | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6'
  | 'M7' | 'M8' | 'M9' | 'M10' | 'M11' | 'M12';

/** An arbitrary inclusive month range (P2.5b custom date range). Months are 1..12. */
export interface CustomRange {
  readonly from: number;
  readonly to: number;
}

/**
 * The period the dashboard is viewed through: either a named period or a custom
 * month range. Everything resolves to a set of months via `monthsOf(period)`.
 */
export type Period = NamedPeriod | CustomRange;

/** Hours split across the twelve calendar months. Period totals are derived. */
export interface MonthlyHours {
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  m7: number;
  m8: number;
  m9: number;
  m10: number;
  m11: number;
  m12: number;
}
