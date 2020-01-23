import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulativeUploadModalComponent } from './regulative-upload-modal.component';

describe('RegulativeUploadModalComponent', () => {
  let component: RegulativeUploadModalComponent;
  let fixture: ComponentFixture<RegulativeUploadModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegulativeUploadModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulativeUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
