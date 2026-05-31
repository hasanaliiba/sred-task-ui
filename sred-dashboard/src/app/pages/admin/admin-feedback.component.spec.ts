import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';

import { AdminFeedbackComponent } from './admin-feedback.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';
import { Feedback } from '../../models';

const FEEDBACK: Feedback[] = [
  { id: '1', clientId: 'afiniti', clientName: 'Afiniti', message: 'A', rating: 5, submittedAt: '2025-10-01T00:00:00Z' },
  { id: '2', clientId: 'salesflo', clientName: 'Salesflo', message: 'B', rating: 3, submittedAt: '2025-11-01T00:00:00Z' },
];

class FakeDataService {
  feedback$ = of(FEEDBACK);
}
class FakeAuthService {
  currentUser$ = of({ displayName: 'Admin', role: 'admin' });
}

describe('AdminFeedbackComponent', () => {
  let component: AdminFeedbackComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminFeedbackComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardDataService, useClass: FakeDataService },
        { provide: AuthService, useClass: FakeAuthService },
      ],
    });
    component = TestBed.createComponent(AdminFeedbackComponent).componentInstance;
  });

  it('shows all feedback with average rating, newest first by default', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.count).toBe(2);
    expect(vm.avg).toBe(4);
    expect(vm.rows[0].id).toBe('2'); // Nov before Oct
    expect(vm.clients.length).toBe(2);
  });

  it('filters by client', async () => {
    component.setFilter('afiniti');
    const vm = await firstValueFrom(component.vm$);
    expect(vm.count).toBe(1);
    expect(vm.rows[0].clientName).toBe('Afiniti');
  });

  it('sorts by highest rating', async () => {
    component.setSort('highest');
    const vm = await firstValueFrom(component.vm$);
    expect(vm.rows[0].rating).toBe(5);
  });
});
