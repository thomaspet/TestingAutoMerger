import { Output, SimpleChanges } from '@angular/core';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { EmployeeService, EmploymentService } from '@app/services/services';
import { Employee, Employment, IncomeReportData, TypeOfEmployment } from '@uni-entities';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IncomeReportsService, YtelseKodeliste } from '../../shared-services/incomeReportsService';
import { IncomeReportHelperService } from '../../shared-services/incomeReportHelperService';
import { map, switchMap } from 'rxjs/operators';

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
    showMultipleEmploymentsWarning: boolean = false;
    private employmentsToInclude: number = 0;


    forceCloseValueResolver?: () => any;
    canDeactivate?: () => boolean | Observable<boolean>;

    constructor(
        private employeeService: EmployeeService,
        private employmentService: EmploymentService,
        private incomeReportsService: IncomeReportsService,
        private incomeReportHelperService: IncomeReportHelperService,
        private toastService: ToastService,
    ) { }

    ngOnInit(): void {
        this.busy = true;
        let incomereport = this.options.data;
        this.isNewIncomeReport = !incomereport;
        this.initNewIncomeReport();
        if (incomereport) {
            const endringIncomeReport = this.clearIncomeReportStatus(incomereport);
            this.incomereport$.next(endringIncomeReport);
            this.employeeChange(endringIncomeReport.Employment.EmployeeID, endringIncomeReport.EmploymentID);
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


    clearIncomeReportStatus(incomereport: IncomeReportData): IncomeReportData {
        incomereport.AltinnReceipt = null;
        incomereport.AltinnReceiptID = null;
        incomereport.CreatedAt = null;
        incomereport.CreatedBy = null;
        incomereport.StatusCode = null;
        incomereport.UpdatedAt = null;
        incomereport.UpdatedBy = null;
        incomereport.Xml = null;
        return incomereport;
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
        if (!incomereport.EmploymentID || !incomereport.Type || !incomereport.Employment.EmployeeID) {
            this.toastService.addToast('Mangler data', ToastType.bad, ToastTime.medium, 'Må velge ansatt, arbeidsforhold og ytelse');
        } else {
            const incomeReportToCreate$ = incomereport.ID
                ? of({ ...incomereport, ID: 0, EmploymentID: incomereport.EmploymentID })
                : this.incomeReportsService.createIncomeReport(YtelseKodeliste[incomereport.Type], incomereport.EmploymentID);
            incomeReportToCreate$
                .pipe(
                    map(newReport => {
                        if (newReport.Report) {
                            if (this.showMultipleEmploymentsWarning) {
                                newReport.Report.Skjemainnhold.arbeidsforhold.arbeidsforholdId = newReport.EmploymentID;
                            }
                            newReport.Report.Skjemainnhold.aarsakTilInnsending = 'Ny';
                        }
                        return newReport;
                    }),
                    switchMap(newReport => this.incomeReportsService.Post(newReport))
                )
                .subscribe(createdreport => {
                    if (createdreport.ID) {
                        this.onClose.emit(createdreport);
                    }
                });
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes['Employment.EmployeeID']) {
            const empId = changes['Employment.EmployeeID'].currentValue;
            this.employeeChange(empId);
        }
        if (changes['Type']) {
            if (changes['Type'].currentValue === YtelseKodeliste[YtelseKodeliste.Foreldrepenger]) {
                this.showMultipleEmploymentsWarning = false;
            } else if (this.employmentsToInclude > 1) {
                this.showMultipleEmploymentsWarning = true;
            }
        }
    }

    employeeChange(employeeID: number, employmentID: number = -1) {
        this.employmentService.GetAll(`filter=EmployeeID eq ${employeeID}`).subscribe(res => {
            this.employments = res;
            this.showMultipleEmploymentsWarning = false;
            this.employmentsToInclude = 0;
            if (res.length > 0) {
                const current = this.incomereport$.getValue();
                if (current) {
                    res.forEach((emp: Employment) => {
                        if (employmentID > 0) {
                            if (emp.ID === employmentID) { current.EmploymentID = emp.ID; }
                        } else {
                            if (emp.Standard) { current.EmploymentID = emp.ID; }
                        }

                        if ((emp.TypeOfEmployment === TypeOfEmployment.OrdinaryEmployment
                            || emp.TypeOfEmployment === TypeOfEmployment.MaritimeEmployment
                            || emp.TypeOfEmployment === TypeOfEmployment.FrilancerContratorFeeRecipient) &&
                            emp.StartDate && !emp.EndDate) { this.employmentsToInclude++; }
                    });
                    if (this.employmentsToInclude > 1 && current.Type !== YtelseKodeliste[YtelseKodeliste.Foreldrepenger]) {
                        this.showMultipleEmploymentsWarning = true;
                    }
                    this.incomereport$.next(current);
                }
            }
            this.fields$.next(this.getFields());
        });
    }

    getFields() {
        return [
            <UniFieldLayout>
            {
                EntityType: 'IncomeReportData',
                Property: 'Employment.EmployeeID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Ansatt',
                FieldSet: 0,
                Section: 0,
                Placement: 2,
                ReadOnly: !this.isNewIncomeReport,
                Tooltip: {
                    Text: 'Velg ansatt det skal sendes inntektsmelding for'
                },
                Options: {
                    source: this.employees,
                    valueProperty: 'ID',
                    template: (employee: Employee) => employee
                        ? `${employee.EmployeeNumber} - ${employee.BusinessRelationInfo.Name}`
                        : ''
                }
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReportData',
                Property: 'EmploymentID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Arbeidsforhold',
                FieldSet: 0,
                Section: 0,
                Placement: 2,
                ReadOnly: false,
                Tooltip: {
                    Text: 'En ansatt må ha registrert arbeidsforhold i AA-registeret for å kunne sende inn inntektsmelding.Er det flere aktive arbeidsforhold for den ansatte skal det sendes en inntektsmelding for hvert arbeidsforhold. Det må også sendes inn inntektsmelding, med 0 i beløp, for aktive arbeidsforhold det ikke kreves refusjon for.'
                },
                Options: {
                    source: this.employments,
                    valueProperty: 'ID',
                    template: (employment: Employment) => employment
                        ? `${employment.ID} - ${employment.JobName}`
                        : ''
                }
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReportData',
                Property: 'Type',
                FieldType: FieldType.DROPDOWN,
                Label: 'Velg ytelse',
                FieldSet: 0,
                Section: 0,
                ReadOnly: !this.isNewIncomeReport,
                Tooltip: {
                    Text: 'Velg ytelse som gir grunnlag for refusjonskravet.  Hver ytelse har ulike krav til dokumentasjon, og det er ikke mulig å endre type ytelse etter at skjemaet er opprettet.  Er du usikker på hvilke type ytelse du skal sende refusjon for så ta kontakt med NAV eller sjekk nettsiden Nav.no.'
                },
                Options: {
                    source: this.incomeReportHelperService.getYtelseskoder(),
                    valueProperty: 'Code',
                    displayProperty: 'Value2',
                    hideDeleteButton: true
                }
            }
        ];
    }

}
