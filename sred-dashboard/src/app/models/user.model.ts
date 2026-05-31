/** Authentication role (Feature G). */
export type Role = 'admin' | 'client';

/**
 * A seeded login (mock auth — no real security).
 * Clients are scoped to one workspace; the admin sees all feedback and settings.
 */
export interface User {
  username: string; // "afiniti" | "salesflo" | "admin"
  displayName: string; // "Afiniti" | "Salesflo" | "Admin"
  role: Role;
  clientId: string | null; // workspace the user belongs to; null for admin
  password: string; // seeded, shared (MOCK ONLY — never do this in production)
}
