import {Component, OnInit, Input, ViewChildren, QueryList, Output, EventEmitter} from '@angular/core';
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
import {ToastService, ToastTime, ToastType} from '../../../../../framework/uniToast/toastService';
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
    @Input() public runID: number;
    @Output() public busy: EventEmitter<boolean> = new EventEmitter();
    @Output() public selectedEmails: EventEmitter<number> = new EventEmitter();
    @Output() public selectedPrints: EventEmitter<number> = new EventEmitter();
    @ViewChildren(UniTable) private tables: QueryList<UniTable>;

    private paychecksEmail: Employee[] = [];
    private paychecksPrint: Employee[] = [];
    private paycheckTableConfig: UniTableConfig;
    private paycheckPrintTableConfig: UniTableConfig;

    constructor(
        private payrollrunService: PayrollrunService,
        private reportdefinitionService: ReportDefinitionService,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.loadEmployeesInPayrollrun();
        this.setupPaycheckTable();
    }

    public emailPaychecks() {
        Observable
            .of(this.getSelectedEmail())
            .filter(emps => !!emps.length)
            .do(() => this.busy.next(true))
            .switchMap(emps => this.payrollrunService.emailPaychecks(emps, this.runID))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.busy.next(false))
            .do((response: boolean) => {
                if (!response) {
                    return;
                }

                this.resetRowSelection(this.tables.toArray()[0]);
                this.emailRowSelectionChanged();
            })
            .subscribe((response: boolean) => {
                response
                    ? this.toastService
                        .addToast(
                        'Lønnslipper er sendt',
                        ToastType.good,
                        ToastTime.short,
                        'Valgte lønnslipper er sendt til ansatte')
                    : this.toastService
                        .addToast(
                        'Feil',
                        ToastType.bad,
                        ToastTime.short,
                        'Sending av valgte lønnslipper feilet');
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
                if (report) {
                    let employeeTransFilter = '(' + prints
                        .map((emp: Employee) => 'EmployeeID eq ' + emp.ID)
                        .join(' or ') + ')';
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

    private resetRowSelection(table: UniTable) {
        table.getSelectedRows()
            .forEach(row => {
                row['_rowSelected'] = false;
                table.updateRow(row['_originalIndex'], row);
            });
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
                    if (employee.BusinessRelationInfo &&
                        employee.BusinessRelationInfo.DefaultEmail &&
                        employee.BusinessRelationInfo.DefaultEmail.EmailAddress) {

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
        let emailCol = new UniTableColumn(
            'BusinessRelationInfo.DefaultEmail.EmailAddress', 'Epost', UniTableColumnType.Text
        );

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

    public emailRowSelectionChanged() {
        this.selectedEmails.next(this.getSelectedEmail().length);
    }

    public printRowSelectionChanged() {
        this.selectedPrints.next(this.getSelectedPrint().length);
    }

}
