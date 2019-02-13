import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmeldingPeriodSplitViewComponent } from './amelding-period-split-view.component';

describe('AmeldingPeriodSplitViewComponent', () => {
  let component: AmeldingPeriodSplitViewComponent;
  let fixture: ComponentFixture<AmeldingPeriodSplitViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmeldingPeriodSplitViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmeldingPeriodSplitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
