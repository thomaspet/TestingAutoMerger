import { Output, SimpleChanges } from '@angular/core';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { EmployeeService, EmploymentService } from '@app/services/services';
import { Employee, Employment, FieldType, IncomeReportData } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { BehaviorSubject, Observable } from 'rxjs';
import { IncomeReportsService, YtelseKodeliste } from '../shared-services/incomeReportsService';

@Component({
    templateUrl: './income-report-modal.html',
})

export class IncomeReportModal implements IUniModal, OnInit {
    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    incomereport$ = new BehaviorSubject<IncomeReportData>(null);
    isNewIncomeReport: boolean;
    fields$ = new BehaviorSubject([]);
    config$ = new BehaviorSubject({});

    private employees: Employee[];
    private employments: Employment[];

    busy: boolean;
    ytelseskoder: { id: number; name: string }[] = [];


    forceCloseValueResolver?: () => any;
    canDeactivate?: () => boolean | Observable<boolean>;

    constructor(
        private employeeService: EmployeeService,
        private employmentService: EmploymentService,
        private incomeReportsService: IncomeReportsService,
        private toastService: ToastService,
    ) {
        this.setupMap();
    }

    ngOnInit(): void {
        this.busy = true;
        let incomereport = this.options.data;
        this.isNewIncomeReport = !incomereport;
        this.initNewIncomeReport();
        if (incomereport) {
            this.employeeChange(incomereport.Employment.EmployeeID);
            this.incomereport$.next(incomereport);
        } else {
            incomereport = new IncomeReportData();
            this.incomereport$.next(incomereport);
        }
        this.busy = false;
    }

    ngOnDestroy() {
        this.incomereport$.complete();
        this.fields$.complete();
        this.config$.complete();
    }

    setupMap() {
        for (const n in YtelseKodeliste) {
            if (typeof YtelseKodeliste[n] === 'number') {
                this.ytelseskoder.push({ id: <any>YtelseKodeliste[n], name: n });
            }
        }
    }

    initNewIncomeReport() {
        this.employeeService.GetAll('', ['BusinessRelationInfo'])
            .subscribe(res => {
                this.employees = res;
                this.fields$.next(this.getFields());
            });
    }

    createIncomeReport() {
        const incomereport = this.incomereport$.value;
        if (!incomereport.EmploymentID || !incomereport.Type) {
            this.toastService.addToast('Mangler data', ToastType.bad, ToastTime.medium, 'Må velge både arbeidsforhold og ytelse');
        } else {
            const ytelse = YtelseKodeliste[incomereport.Type];
            this.incomeReportsService.createIncomeReport(ytelse, incomereport.EmploymentID)
                .subscribe(res => {
                    this.incomeReportsService.Post(res).subscribe(createdreport => {
                        if (createdreport.ID) {
                            this.onClose.emit(createdreport);
                        }
                    });
                });
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes['EmployeeID']) {
            const empId = changes['EmployeeID'].currentValue;
            this.employeeChange(empId);
        }

    }
    employeeChange(empId: number) {
        this.employmentService.GetAll(`filter=EmployeeID eq ${empId}`).subscribe(res => {
            this.employments = res;
            if (res.length > 0) {
                const current = this.incomereport$.getValue();
                res.forEach(emp => {
                    if (emp.Standard) { current.EmploymentID = emp.ID; }
                });
                this.incomereport$.next(current);
            }
            this.fields$.next(this.getFields());
        });
    }

    getFields() {
        return [
            {
                EntityType: 'IncomeReportData',
                Property: 'Employment.EmployeeID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Ansatt',
                FieldSet: 0,
                Section: 0,
                Placement: 2,
                Options: {
                    source: this.employees,
                    valueProperty: 'ID',
                    template: (employee: Employee) => employee
                        ? `${employee.EmployeeNumber} - ${employee.BusinessRelationInfo.Name}`
                        : ''
                }
            },
            {
                EntityType: 'IncomeReportData',
                Property: 'EmploymentID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Arbeidsforhold',
                FieldSet: 0,
                Section: 0,
                Placement: 2,
                Options: {
                    source: this.employments,
                    valueProperty: 'ID',
                    template: (employment: Employment) => employment
                        ? `${employment.EmployeeNumber} - ${employment.JobName}`
                        : ''
                }
            },
            {
                EntityType: 'IncomeReportData',
                Property: 'Type',
                FieldType: FieldType.DROPDOWN,
                Label: 'Velg ytelse',
                FieldSet: 0,
                Section: 0,
                Options: {
                    source: this.ytelseskoder,
                    valueProperty: 'name',
                    displayProperty: 'name',
                    template: (obj) => `${obj.id} - ${obj.name}`,
                    hideDeleteButton: true
                }
            }
        ];
    }

}
