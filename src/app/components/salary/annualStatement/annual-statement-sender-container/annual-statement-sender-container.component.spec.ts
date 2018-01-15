import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStatementSenderContainerComponent } from './annual-statement-sender-container.component';

describe('AnnualStatementSenderContainerComponent', () => {
  let component: AnnualStatementSenderContainerComponent;
  let fixture: ComponentFixture<AnnualStatementSenderContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualStatementSenderContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualStatementSenderContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
