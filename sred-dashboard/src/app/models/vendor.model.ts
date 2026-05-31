/**
 * A non-labor expense tied to a project (Feature E).
 * SR&ED-flagged invoices add to SR&ED expenditure; every invoice's amount rolls
 * into its project's total expenditure. Period-filtered by `invoiceDate`.
 */
export interface VendorInvoice {
  id: string;
  invoiceDate: string; // ISO — "Invoice Submitted"; maps to a quarter for period filtering
  invoiceNumber: string;
  amount: number;
  vendorName: string;
  providerName: string; // "Name of Provider"
  projectId: string; // tied to a project → rolls into that project's expenditure
  description: string;
  isSred: boolean;
  province: string;
  status: string; // "In Progress" | "Completed" ...
}
