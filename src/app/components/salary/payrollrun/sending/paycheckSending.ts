import {Component, OnInit, Input, ViewChildren, ViewChild, QueryList, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Employee, PayrollRun} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
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
    ReportNames,
    FinancialYearService
} from '../../../../services/services';

export enum PaycheckFormat {
    E_MAIL = 'Epost',
    PRINT = 'Utskrift'
}

@Component({
    selector: 'paycheck-sending',
    templateUrl: './paycheckSending.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaycheckSending implements OnInit {
    @Input() public runID: number;
    @Output() public busy: EventEmitter<boolean> = new EventEmitter();
    @Output() public selectedEmps: EventEmitter<number> = new EventEmitter();
    @ViewChild(UniTable) public table: UniTable;

    private paychecksEmail: Employee[] = [];
    private paychecksPrint: Employee[] = [];
    private employees$: BehaviorSubject<Employee[]> = new BehaviorSubject([]);
    private tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);

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

    public handlePaychecks(printAll: boolean = false) {
        let emps = this.getSelected();
        let selectedPrints = emps.filter(emp => emp['_paycheckFormat'] === PaycheckFormat.PRINT);
        let selectedEmails = emps.filter(emp => emp['_paycheckFormat'] === PaycheckFormat.E_MAIL);
        this.printPaychecks(printAll ? emps : selectedPrints);

        if (printAll) {
            this.resetRows();
            return;
        }

        this.emailPaychecks(selectedEmails)
            .subscribe(response => {
                if (!response) {
                    return;
                }
                this.resetRows();
            });
    }

    private emailPaychecks(employees: Employee[]): Observable<boolean> {
        return Observable
            .of(employees)
            .filter(emps => !!emps.length)
            .do(() => this.busy.next(true))
            .switchMap(emps => this.payrollrunService.emailPaychecks(emps, this.runID))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .finally(() => this.busy.next(false))
            .do((response: boolean) => {
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

    private printPaychecks(employees: Employee[]) {
        this.reportdefinitionService
            .getReportByName(ReportNames.PAYCHECK_EMP_FILTER)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((report) => {
                if (!report) {
                    return;
                }
                let employeeFilter = employees
                    .map(emp => emp.EmployeeNumber)
                    .join(',');

                report.parameters = [
                    {Name: 'EmployeeFilter', value: employeeFilter},
                    {Name: 'RunID', value: this.runID}
                ];

                this.modalService.open(UniPreviewModal, {data: report});
            });
    }

    private resetRowSelection() {
        this.table
            .getSelectedRows()
            .forEach(row => {
                row['_rowSelected'] = false;
                this.table.updateRow(row['_originalIndex'], row);
            });
    }

    private getSelected(): Employee[] {
        return this.table.getSelectedRows();
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
                        employee['_paycheckFormat'] = PaycheckFormat.E_MAIL;
                        tmpEmail.push(employee);
                    } else {
                        employee['_paycheckFormat'] = PaycheckFormat.PRINT;
                        tmpPrint.push(employee);
                    }
                });
                this.employees$.next(emps);
                this.paychecksEmail = tmpEmail;
                this.paychecksPrint = tmpPrint;
            });
    }

    private setupPaycheckTable() {
        let employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text, false);
        let employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        let emailCol = new UniTableColumn(
            'BusinessRelationInfo.DefaultEmail.EmailAddress',
            'Epost',
            UniTableColumnType.Text,
            false);

        let typeCol = new UniTableColumn(
            '_paycheckFormat',
            'Type',
            UniTableColumnType.Select,
            (row) => this.typeColIsEditable(row))
            .setEditorOptions({
                resource: [
                    PaycheckFormat.E_MAIL,
                    PaycheckFormat.PRINT
                ],
                itemTemplate: item => item
            });

        let config = new UniTableConfig('salary.payrollrun.sending.paychecks', true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol]);

        this.tableConfig$.next(config);
    }

    private typeColIsEditable(row: Employee): boolean {
        return !!(row.BusinessRelationInfo
            && row.BusinessRelationInfo.DefaultEmail
            && row.BusinessRelationInfo.DefaultEmail.EmailAddress);
    }

    private resetRows() {
        this.resetRowSelection();
        this.rowSelectionChange();
    }

    public rowSelectionChange() {
        this.selectedEmps.next(this.getSelected().length);
    }

}
