import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpPeriodWagetypeModalComponent } from './otp-period-wagetype-modal.component';

describe('OtpPeriodWagetypeModalComponent', () => {
  let component: OtpPeriodWagetypeModalComponent;
  let fixture: ComponentFixture<OtpPeriodWagetypeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpPeriodWagetypeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpPeriodWagetypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
