import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelLinesComponent } from './travel-lines.component';

describe('TravelLinesComponent', () => {
  let component: TravelLinesComponent;
  let fixture: ComponentFixture<TravelLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
