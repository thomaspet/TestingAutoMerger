import {Component, OnInit, Input, ViewChildren, QueryList, ViewChild} from '@angular/core';
import {Employee, PayrollRun} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType,
    UniTable
} from '../../../../../framework/ui/unitable/index';
import {
    ErrorService,
    PayrollrunService,
    ReportDefinitionService,
    FinancialYearService
} from '../../../../services/services';

@Component({
    selector: 'paycheck-sending',
    templateUrl: './paycheckSending.html'
})
export class PaycheckSending implements OnInit {
    @Input()
    private runID: number;

    @ViewChildren(UniTable)
    private tables: QueryList<UniTable>;

    private paychecksEmail: Employee[] = [];
    private paychecksPrint: Employee[] = [];
    private paycheckTableConfig: UniTableConfig;
    private paycheckPrintTableConfig: UniTableConfig;

    constructor(
        private payrollrunService: PayrollrunService,
        private reportdefinitionService: ReportDefinitionService,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.loadEmployeesInPayrollrun();
        this.setupPaycheckTable();
    }

    public emailPaychecks() {
        let emps: Employee[] = this.getSelectedEmail();
        this.payrollrunService.emailPaychecks(emps, this.runID)
            .subscribe((response: boolean) => {
                return response;
            });
    }

    public printPaychecks(all) {
        let prints = all ? this.getSelected() : this.getSelectedPrint();
        if (!prints) {
            return;
        }
        Observable.forkJoin(
            this.reportdefinitionService.getReportByName('Lønnslipp'),
            this.payrollrunService.get(this.runID),
            this.financialYearService.getActiveYear())
        .subscribe((response: [any, PayrollRun, number]) => {
            let [report, payrollRun, thisYear] = response;
            if ( report) {
                let employeeTransFilter = '(' + prints
                    .map((emp: Employee) => 'EmployeeID eq ' + emp.ID)
                    .join( ' or ') + ')';
                let transFilter = employeeTransFilter + ` and (PayrollRunID eq ${this.runID})`;
                let employeeFilter = prints
                    .map(emp => 'ID eq ' + emp.ID)
                    .join(' or ');


                report.parameters = [
                    {Name: 'TransFilter', value: transFilter},
                    {Name: 'ThisYear', value: thisYear},
                    {Name: 'LastYear', value: thisYear - 1},
                    {Name: 'PayDate', value: payrollRun.PayDate},
                    {Name: 'EmployeeFilter', value: employeeFilter},
                    {Name: 'RunID', value: this.runID}
                ];

                this.modalService.open(UniPreviewModal, {data: report});
            }
        }, err => this.errorService.handle(err));
    }

    private getSelected(): Employee[] {
        var emails = this.tables.toArray()[0].getSelectedRows();
        var print = this.tables.toArray()[1].getSelectedRows();

        return emails.concat(print);
    }

    private getSelectedEmail(): Employee[] {
        return this.tables.toArray()[0].getSelectedRows();
    }

    private getSelectedPrint(): Employee[] {
        return this.tables.toArray()[1].getSelectedRows();
    }

    private loadEmployeesInPayrollrun() {
        let tmpEmail: Employee[] = [];
        let tmpPrint: Employee[] = [];

        this.payrollrunService.getEmployeesOnPayroll(this.runID,
            ['BusinessRelationInfo', 'BusinessRelationInfo.DefaultEmail'])
            .subscribe((emps: Employee[]) => {
                emps.forEach(employee => {
                    if (employee.BusinessRelationInfo && employee.BusinessRelationInfo.DefaultEmail) {
                        tmpEmail.push(employee);
                    } else {
                        tmpPrint.push(employee);
                    }
                });
                this.paychecksEmail = tmpEmail;
                this.paychecksPrint = tmpPrint;
            });
    }

    private setupPaycheckTable() {
        let employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text);
        let employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);
        let emailCol = new UniTableColumn('BusinessRelationInfo.DefaultEmail.EmailAddress', 'Epost', UniTableColumnType.Text);

        this.paycheckTableConfig = new UniTableConfig('salary.payrollrun.sending.paycheck', true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol]);

        this.paycheckPrintTableConfig = new UniTableConfig('salary.payrollrun.sending.print', true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol]);
    }
}
