import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { DashboardDataService } from './dashboard-data.service';
import { User } from '../models';

const USERS: User[] = [
  { username: 'afiniti', displayName: 'Afiniti', role: 'client', clientId: 'afiniti', password: 'sred2025' },
  { username: 'admin', displayName: 'Admin', role: 'admin', clientId: null, password: 'sred2025' },
];

class FakeDataService {
  users = USERS;
  activeClient: string | null = 'UNSET';
  setActiveClient(id: string | null): void {
    this.activeClient = id;
  }
}

describe('AuthService', () => {
  let auth: AuthService;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: DashboardDataService, useClass: FakeDataService }],
    });
    auth = TestBed.inject(AuthService);
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('logs in a client and scopes the active client', () => {
    const user = auth.login('afiniti', 'sred2025');
    expect(user?.role).toBe('client');
    expect(auth.isAuthenticated).toBeTrue();
    expect(auth.isAdmin).toBeFalse();
    expect(data.activeClient).toBe('afiniti');
  });

  it('logs in an admin with no active client', () => {
    auth.login('admin', 'sred2025');
    expect(auth.isAdmin).toBeTrue();
    expect(data.activeClient).toBeNull();
  });

  it('rejects bad credentials without changing state', () => {
    expect(auth.login('afiniti', 'wrong')).toBeNull();
    expect(auth.login('ghost', 'sred2025')).toBeNull();
    expect(auth.isAuthenticated).toBeFalse();
  });

  it('is case-insensitive and trims the username', () => {
    expect(auth.login('  AFINITI ', 'sred2025')).not.toBeNull();
    expect(auth.isAuthenticated).toBeTrue();
  });

  it('logs out and clears the active client', () => {
    auth.login('afiniti', 'sred2025');
    auth.logout();
    expect(auth.isAuthenticated).toBeFalse();
    expect(auth.currentUser).toBeNull();
    expect(data.activeClient).toBeNull();
  });
});
