import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReconciliationListParamsModalComponent } from './reconciliation-list-params-modal.component';

describe('ReconciliationListParamsModalComponent', () => {
  let component: ReconciliationListParamsModalComponent;
  let fixture: ComponentFixture<ReconciliationListParamsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconciliationListParamsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconciliationListParamsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
