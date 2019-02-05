import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaycheckMailOptionsComponent } from './paycheck-mail-options.component';

describe('PaycheckMailOptionsComponent', () => {
  let component: PaycheckMailOptionsComponent;
  let fixture: ComponentFixture<PaycheckMailOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaycheckMailOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaycheckMailOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
