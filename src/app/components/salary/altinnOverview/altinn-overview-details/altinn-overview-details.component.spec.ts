import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltinnOverviewDetailsComponent } from './altinn-overview-details.component';

describe('AltinnOverviewDetailsComponent', () => {
  let component: AltinnOverviewDetailsComponent;
  let fixture: ComponentFixture<AltinnOverviewDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltinnOverviewDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltinnOverviewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
