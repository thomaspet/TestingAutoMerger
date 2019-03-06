import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodAdminModalComponent } from './period-admin-modal.component';

describe('PeriodAdminModalComponent', () => {
  let component: PeriodAdminModalComponent;
  let fixture: ComponentFixture<PeriodAdminModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodAdminModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
