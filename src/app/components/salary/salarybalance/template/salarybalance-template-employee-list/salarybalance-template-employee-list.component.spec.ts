import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarybalanceTemplateEmployeeListComponent } from './salarybalance-template-employee-list.component';

describe('SalarybalanceTemplateEmployeeListComponent', () => {
  let component: SalarybalanceTemplateEmployeeListComponent;
  let fixture: ComponentFixture<SalarybalanceTemplateEmployeeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarybalanceTemplateEmployeeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarybalanceTemplateEmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
