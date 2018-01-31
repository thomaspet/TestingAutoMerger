import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltinnResponseStatusComponent } from './altinn-response-status.component';

describe('AltinnResponseStatusComponent', () => {
  let component: AltinnResponseStatusComponent;
  let fixture: ComponentFixture<AltinnResponseStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltinnResponseStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltinnResponseStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
