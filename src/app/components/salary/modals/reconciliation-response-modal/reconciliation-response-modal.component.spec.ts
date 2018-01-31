import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconciliationResponseModalComponent } from './reconciliation-response-modal.component';

describe('ReconciliationResponseModalComponent', () => {
  let component: ReconciliationResponseModalComponent;
  let fixture: ComponentFixture<ReconciliationResponseModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconciliationResponseModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconciliationResponseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
