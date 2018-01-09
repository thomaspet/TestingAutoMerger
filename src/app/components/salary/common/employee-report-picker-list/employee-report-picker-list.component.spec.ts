import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EmployeeReportPickerListComponent} from './employee-report-picker-list.component';
import {Employee} from '@uni-entities';

describe('EmployeeReportPickerListComponent', () => {
    let component: EmployeeReportPickerListComponent;
    let fixture: ComponentFixture<EmployeeReportPickerListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ EmployeeReportPickerListComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmployeeReportPickerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
