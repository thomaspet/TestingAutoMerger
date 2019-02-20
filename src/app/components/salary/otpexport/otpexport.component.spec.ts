import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OTPExportComponent } from './otpexport.component';

describe('OTPExportComponent', () => {
  let component: OTPExportComponent;
  let fixture: ComponentFixture<OTPExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OTPExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OTPExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
