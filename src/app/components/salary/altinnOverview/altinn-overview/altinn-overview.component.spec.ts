import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltinnOverviewComponent } from './altinn-overview.component';

describe('AltinnOverviewComponent', () => {
  let component: AltinnOverviewComponent;
  let fixture: ComponentFixture<AltinnOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltinnOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltinnOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
