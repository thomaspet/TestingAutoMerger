import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncWagetypesModalComponent } from './sync-wagetypes-modal.component';

describe('SyncWagetypesModalComponent', () => {
  let component: SyncWagetypesModalComponent;
  let fixture: ComponentFixture<SyncWagetypesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncWagetypesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncWagetypesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
