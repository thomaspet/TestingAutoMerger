import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTransferComponent } from './time-transfer.component';

describe('TimeTransferComponent', () => {
  let component: TimeTransferComponent;
  let fixture: ComponentFixture<TimeTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
