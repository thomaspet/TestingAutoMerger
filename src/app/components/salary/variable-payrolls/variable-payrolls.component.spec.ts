import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VariablePayrollsComponent } from './variable-payrolls.component';

describe('VariablePayrollsComponent', () => {
  let component: VariablePayrollsComponent;
  let fixture: ComponentFixture<VariablePayrollsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VariablePayrollsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablePayrollsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
