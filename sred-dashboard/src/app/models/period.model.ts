/**
 * Reporting period the dashboard is viewed through (Feature B).
 * Q1–Q4 are individual quarters; H1 = Q1+Q2, H2 = Q3+Q4, FY = full year.
 * (Month + custom-range selection is layered on in P2.5.)
 */
export type Period = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'FY';

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
