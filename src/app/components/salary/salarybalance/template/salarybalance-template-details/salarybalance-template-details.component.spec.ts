import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarybalanceTemplateDetailsComponent } from './salarybalance-template-details.component';

describe('SalarybalanceTemplateDetailsComponent', () => {
  let component: SalarybalanceTemplateDetailsComponent;
  let fixture: ComponentFixture<SalarybalanceTemplateDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarybalanceTemplateDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarybalanceTemplateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
