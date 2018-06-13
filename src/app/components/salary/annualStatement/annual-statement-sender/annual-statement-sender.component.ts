import {Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import {EmployeeReportPickerListComponent} from '../../common/employee-report-picker-list/employee-report-picker-list.component';
import {ErrorService, EmployeeService, AnnualStatementService, ReportNames} from '../../../../services/services';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {Observable, BehaviorSubject} from 'rxjs';
import {Employee} from '../../../../unientities';

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

    @ViewChild(EmployeeReportPickerListComponent)
    private empReportCmp: EmployeeReportPickerListComponent;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private employeeService: EmployeeService,
        private annualStatementService: AnnualStatementService
    ) {}

    public ngOnInit() {
        this.tabService.addTab({
            moduleID: UniModules.AnnualStatements,
            name: 'Årsoppgave',
            active: true,
            url: this.url
        });
        this.fetchEmployees();
    }

    private fetchEmployees() {
        this.employeeService
            .GetAll('', ['BusinessRelationInfo.DefaultEmail'])
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

        return this.annualStatementService
            .sendMail(mailEmps)
            .finally(() => {
                this.busy.next(false);
                this.empReportCmp.resetRows();
            });
    }

    private createFilter(employees: Employee[]): string {
        return employees.map(emp => emp.EmployeeNumber).join(',');
    }

    public onSelect(event: number) {
        this.selectedEmps.next(event);
    }

}
