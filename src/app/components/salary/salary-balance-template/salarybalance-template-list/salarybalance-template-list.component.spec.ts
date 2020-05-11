import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarybalanceTemplateListComponent } from './salarybalance-template-list.component';

describe('SalarybalanceTemplateListComponent', () => {
  let component: SalarybalanceTemplateListComponent;
  let fixture: ComponentFixture<SalarybalanceTemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalarybalanceTemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarybalanceTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
