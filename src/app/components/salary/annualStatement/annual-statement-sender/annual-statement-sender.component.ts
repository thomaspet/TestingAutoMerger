import {Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {take, switchMap, finalize} from 'rxjs/operators';
import { IAnnualStatementEmailInfo, AnnualStatementService } from '@app/components/salary/annualStatement/shared/service/annualStatementService';
import { Employee, CompanySettings } from '@uni-entities';
import { EmployeeReportPickerListComponent } from '@app/components/salary/shared/components/employee-report-picker-list/employee-report-picker-list.component';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { EmployeeService, BrowserStorageService, FinancialYearService, CompanySettingsService, ReportNames } from '@app/services/services';

const DEFAULT_OPTIONS_KEY = 'Default_Annual_Statement_Options';

@Component({
    selector: 'uni-annual-statement-sender',
    templateUrl: './annual-statement-sender.component.html',
    styleUrls: ['./annual-statement-sender.component.sass']
})
export class AnnualStatementSenderComponent implements OnInit {
    private url: string = '/salary/annualstatements';
    public employees$: BehaviorSubject<Employee[]> = new BehaviorSubject([]);
    @Output() public busy: EventEmitter<boolean> = new EventEmitter();
    @Output() public selectedEmps: EventEmitter<number> = new EventEmitter();

    @ViewChild(EmployeeReportPickerListComponent, { static: true })
    private empReportCmp: EmployeeReportPickerListComponent;
    public formModel$: BehaviorSubject<IAnnualStatementEmailInfo> = new BehaviorSubject({});
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private tabService: TabService,
        private employeeService: EmployeeService,
        private annualStatementService: AnnualStatementService,
        private storageService: BrowserStorageService,
        private yearService: FinancialYearService,
        private companySettingsService: CompanySettingsService,
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            moduleID: UniModules.AnnualStatements,
            name: 'Årsoppgave',
            active: true,
            url: this.url
        });
        this.fetchEmployees();
        this.getDefault()
            .subscribe(def => this.formModel$.next(def));
        this.fields$.next(this.getLayout());
    }

    private fetchEmployees() {
        this.employeeService
            .getEmpsUsedThisYear(1, ['BusinessRelationInfo.DefaultEmail'])
            .subscribe(emps => this.employees$.next(emps));
    }

    public handleAnnualStatements(printAll: boolean) {
        return this.handleAnnualStatementObs(printAll)
            .subscribe();
    }

    public handleAnnualStatementObs(printAll: boolean): Observable<boolean> {
        this.busy.next(true);
        const mailEmps = this.empReportCmp.getSelectedMailEmployees();
        const printEmps = this.empReportCmp.getSelectedPrintEmployees();

        if (printEmps.length || (printAll && mailEmps.length)) {
            const emps = printAll ? [...mailEmps, ...printEmps] : printEmps;
            this.empReportCmp
                .printReport(ReportNames.ANNUAL_STATEMENT, [{Name: 'employeeFilter', value: this.createFilter(emps)}]);
        }

        if (!mailEmps.length || printAll) {
            this.empReportCmp.resetRows();
            this.busy.next(false);
            return Observable.of(true);
        }

        return this.formModel$
            .pipe(
                take(1),
                switchMap(model => this.annualStatementService
                    .sendMail({
                        EmpIDs: mailEmps.map(e => e.ID),
                        Mail: {
                            Subject: model.Subject,
                            Message: model.Message,
                        }
                    })),
                finalize(() => {
                    this.busy.next(false);
                    this.empReportCmp.resetRows();
                })
            );
    }

    private createFilter(employees: Employee[]): string {
        return employees.map(emp => emp.EmployeeNumber).join(',');
    }

    private getDefault(): Observable<IAnnualStatementEmailInfo> {
        let def: IAnnualStatementEmailInfo = this.storageService.getItemFromCompany(DEFAULT_OPTIONS_KEY);
        if (def) {
            return of(def);
        }
        def = {};
        return this.companySettingsService
            .getCompanySettings()
            .map(settings => {
                def.Message = this.defaultMessage(settings);
                def.Subject = this.defaultSubject(this.yearService.getActiveYear());
                return def;
            });
    }

    private defaultSubject(year: number) {
        return `Årsoppgave fra ${year}`;
    }

    private defaultMessage(compSettings: CompanySettings) {
        return `Vedlagt årsoppgave \n\r`
            + `Merk: Passordet for vedlagt fil er ditt fødselsnummer (11 siffer) \n\r`
            + `Med vennlig hilsen \n`
            + compSettings.CompanyName;
    }

    private getLayout(): UniFieldLayout[] {
        return <any[]>[
            {
                Property: 'Subject',
                FieldType: FieldType.TEXT,
                Label: 'Epost emne',
            },
            {
                Property: 'Message',
                FieldType: FieldType.TEXTAREA,
                Label: 'Epost melding',
                Class: 'freeTextField'
            }
        ];
    }

    public onSelect(event: number) {
        this.selectedEmps.next(event);
    }

    public formChange() {
        this.formModel$
            .take(1)
            .subscribe(model => this.storageService.setItemOnCompany(DEFAULT_OPTIONS_KEY, model));
    }

}
