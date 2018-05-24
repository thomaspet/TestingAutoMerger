import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraveltypeComponent } from './traveltype.component';

describe('TraveltypeComponent', () => {
  let component: TraveltypeComponent;
  let fixture: ComponentFixture<TraveltypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraveltypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraveltypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
