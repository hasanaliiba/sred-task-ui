import { TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';

import { TeamHoursChartComponent } from './team-hours-chart.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { TeamHoursBreakdown } from '../../models';

const TEAMS: TeamHoursBreakdown[] = [
  { teamId: 't1', teamName: 'Rendering Team', color: '#28a745', members: [], teamSredHours: 3060, teamUnclaimedHours: 510 },
  { teamId: null, teamName: 'Unassigned', color: '#9ca3af', members: [], teamSredHours: 1270, teamUnclaimedHours: 290 },
];

class FakeDataService {
  teamHoursBreakdown$ = of(TEAMS);
}

describe('TeamHoursChartComponent', () => {
  let component: TeamHoursChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TeamHoursChartComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(TeamHoursChartComponent).componentInstance;
  });

  it('maps teams into stacked SR&ED + Unclaimed series with a data-driven xaxis', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.categories).toEqual(['Rendering Team', 'Unassigned']);
    expect(vm.series[0].name).toBe('SR&ED');
    expect(vm.series[0].data).toEqual([3060, 1270]);
    expect(vm.series[1].data).toEqual([510, 290]);
    expect(vm.xaxis.categories).toEqual(['Rendering Team', 'Unassigned']);
  });

  it('configures a stacked bar chart', () => {
    expect(component.chart.type).toBe('bar');
    expect(component.chart.stacked).toBeTrue();
  });
});
