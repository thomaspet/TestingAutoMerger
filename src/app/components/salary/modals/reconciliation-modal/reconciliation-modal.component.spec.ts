import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconciliationModalComponent } from './reconciliation-modal.component';

describe('ReconciliationModalComponent', () => {
  let component: ReconciliationModalComponent;
  let fixture: ComponentFixture<ReconciliationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconciliationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconciliationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
