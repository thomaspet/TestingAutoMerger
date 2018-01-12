import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltinnReceiptListComponent } from './altinn-receipt-list.component';

describe('AltinnReceiptListComponent', () => {
  let component: AltinnReceiptListComponent;
  let fixture: ComponentFixture<AltinnReceiptListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltinnReceiptListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltinnReceiptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
