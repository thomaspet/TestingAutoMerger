import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpFilterModalComponent } from './otp-filter-modal.component';

describe('OtpFilterModalComponent', () => {
  let component: OtpFilterModalComponent;
  let fixture: ComponentFixture<OtpFilterModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpFilterModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
