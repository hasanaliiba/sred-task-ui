import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TeamsTableComponent } from './teams-table.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { TeamHoursBreakdown } from '../../models';

const TEAMS: TeamHoursBreakdown[] = [
  {
    teamId: 't1', teamName: 'Rendering Team', color: '#28a745',
    members: [
      { id: 'e1', name: 'Anne', sredHours: 1430, unclaimedHours: 390, totalHours: 1820 },
      { id: 'e2', name: 'Liam', sredHours: 1630, unclaimedHours: 120, totalHours: 1750 },
    ],
    teamSredHours: 3060, teamUnclaimedHours: 510,
  },
  {
    teamId: null, teamName: 'Unassigned', color: '#9ca3af',
    members: [{ id: 'e3', name: 'Olivia', sredHours: 1270, unclaimedHours: 290, totalHours: 1560 }],
    teamSredHours: 1270, teamUnclaimedHours: 290,
  },
];

class FakeDataService {
  teamHoursBreakdownFull$ = of(TEAMS);
}

describe('TeamsTableComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TeamsTableComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeamsTableComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    fixture = TestBed.createComponent(TeamsTableComponent);
    fixture.detectChanges();
  });

  it('renders a row per team including the Unassigned group', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Rendering Team');
    expect(text).toContain('Unassigned');
  });

  it('shows member names and aggregated total hours', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Anne, Liam');
    expect(text).toContain('3,570'); // 3060 + 510 total for Rendering Team
  });
});
