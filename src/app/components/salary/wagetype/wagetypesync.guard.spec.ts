import { TestBed, async, inject } from '@angular/core/testing';

import { WagetypeSyncGuard } from './wagetypesync.guard';

describe('WagetypeSyncGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WagetypeSyncGuard]
    });
  });

  it('should ...', inject([WagetypeSyncGuard], (guard: WagetypeSyncGuard) => {
    expect(guard).toBeTruthy();
  }));
});
