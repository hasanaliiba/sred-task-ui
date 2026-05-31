/**
 * A client workspace's profile and reporting parameters (Req 1).
 * `asOfDate` is the cutoff the data is current to and the point the year-end
 * projection extrapolates from (Req 6).
 */
export interface Client {
  id: string; // "afiniti" | "salesflo"
  name: string; // "Afiniti"
  loggedInUser: string;
  timeZone: string; // "EST"
  fiscalYearStart: string; // ISO, e.g. "2025-01-01"
  fiscalYearEnd: string; // ISO, e.g. "2025-12-31"
  asOfDate: string; // ISO — data current to here; drives the projection
  standardAnnualHours: number; // e.g. 2000 — used to derive hourly rate
  sredCreditRate: number; // 0..1, configurable by the admin (Feature G)
}
