/**
 * Feedback a client submits, surfaced to the admin (Feature G).
 * `clientName` is denormalized for convenient admin display.
 */
export interface Feedback {
  id: string;
  clientId: string;
  clientName: string;
  message: string;
  rating: number; // 1–5
  submittedAt: string; // ISO
}
