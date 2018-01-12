import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconciliationRequestComponent } from './reconciliation-request.component';

describe('ReconciliationRequestComponent', () => {
  let component: ReconciliationRequestComponent;
  let fixture: ComponentFixture<ReconciliationRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconciliationRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconciliationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
