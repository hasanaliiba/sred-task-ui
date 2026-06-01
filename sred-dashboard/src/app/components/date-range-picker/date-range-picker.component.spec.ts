import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { DateRangePickerComponent } from './date-range-picker.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { Period } from '../../models';

class FakeDataService {
  period$ = new BehaviorSubject<Period>('FY');
  setPeriod = jasmine.createSpy('setPeriod');
}

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let data: FakeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DateRangePickerComponent],
      providers: [{ provide: DashboardDataService, useClass: FakeDataService }],
    });
    component = TestBed.createComponent(DateRangePickerComponent).componentInstance;
    data = TestBed.inject(DashboardDataService) as unknown as FakeDataService;
  });

  it('reflects a named period as its month span (FY → Jan–Dec, not custom)', async () => {
    const vm = await firstValueFrom(component.vm$);
    expect(vm.from).toBe(1);
    expect(vm.to).toBe(12);
    expect(vm.isCustom).toBeFalse();
  });

  it('reflects a quarter as its span', async () => {
    data.period$.next('Q2');
    const vm = await firstValueFrom(component.vm$);
    expect(vm.from).toBe(4);
    expect(vm.to).toBe(6);
    expect(vm.isCustom).toBeFalse();
  });

  it('marks a custom range as custom and reflects its ends', async () => {
    data.period$.next({ from: 3, to: 8 });
    const vm = await firstValueFrom(component.vm$);
    expect(vm.from).toBe(3);
    expect(vm.to).toBe(8);
    expect(vm.isCustom).toBeTrue();
  });

  it('writes a custom range when an end changes', () => {
    component.setFrom(2, 9);
    expect(data.setPeriod).toHaveBeenCalledWith({ from: 2, to: 9 });
    component.setTo(2, 11);
    expect(data.setPeriod).toHaveBeenCalledWith({ from: 2, to: 11 });
  });
});
