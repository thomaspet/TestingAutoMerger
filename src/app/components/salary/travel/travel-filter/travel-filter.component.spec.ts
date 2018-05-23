import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelFilterComponent } from './travel-filter.component';

describe('TravelFilterComponent', () => {
  let component: TravelFilterComponent;
  let fixture: ComponentFixture<TravelFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
