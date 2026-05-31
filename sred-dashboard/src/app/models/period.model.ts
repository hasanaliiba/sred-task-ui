/**
 * Reporting period the dashboard is viewed through (Feature B).
 * Q1–Q4 are individual quarters; H1 = Q1+Q2, H2 = Q3+Q4, FY = full year.
 */
export type Period = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'FY';

/** Hours split across the four fiscal quarters. Period totals are derived. */
export interface QuarterlyHours {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}
