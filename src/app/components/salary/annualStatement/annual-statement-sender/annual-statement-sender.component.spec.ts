import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStatementSenderComponent } from './annual-statement-sender.component';

describe('AnnualStatementSenderComponent', () => {
  let component: AnnualStatementSenderComponent;
  let fixture: ComponentFixture<AnnualStatementSenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualStatementSenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualStatementSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
