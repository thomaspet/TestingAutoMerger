import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTransTickerComponent } from './employee-trans-ticker.component';

describe('EmployeeTransTickerComponent', () => {
  let component: EmployeeTransTickerComponent;
  let fixture: ComponentFixture<EmployeeTransTickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTransTickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTransTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
