import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmeldingPayrollsPeriodViewComponent } from './amelding-payrolls-period-view.component';

describe('AmeldingPayrollsPeriodViewComponent', () => {
  let component: AmeldingPayrollsPeriodViewComponent;
  let fixture: ComponentFixture<AmeldingPayrollsPeriodViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmeldingPayrollsPeriodViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmeldingPayrollsPeriodViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
