import { Client } from './client.model';
import { Team } from './team.model';
import { Employee } from './employee.model';
import { Project } from './project.model';
import { TimesheetEntry } from './timesheet.model';
import { VendorInvoice } from './vendor.model';
import { User } from './user.model';
import { Feedback } from './feedback.model';

/** One client's complete, self-contained dataset (multi-tenant, Feature G). */
export interface ClientWorkspace {
  client: Client;
  teams: Team[];
  employees: Employee[];
  projects: Project[];
  timesheets: TimesheetEntry[];
  vendorInvoices: VendorInvoice[];
  governmentAssistanceTotal: number;
}

/** The full seed loaded from assets: users, all client workspaces, and feedback. */
export interface DashboardSeed {
  users: User[];
  workspaces: ClientWorkspace[];
  feedback: Feedback[];
}
