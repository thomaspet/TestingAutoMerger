import {Component, OnInit, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Employee} from '../../../../unientities';
import {BehaviorSubject} from 'rxjs';
import {
    UniTableConfig,
    UniTableColumn,
    UniTableColumnType,
    UniTable
} from '../../../../../framework/ui/unitable/index';
import {
    PayrollrunService,
} from '../../../../services/services';

export enum PaycheckFormat {
    E_MAIL = 'E-post',
    PRINT = 'Utskrift'
}

@Component({
    selector: 'paycheck-sending',
    templateUrl: './paycheckSending.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaycheckSending implements OnInit {
    @Input() public runID: number;
    @Output() public selectedEmps: EventEmitter<Employee[]> = new EventEmitter();
    @ViewChild(UniTable) public table: UniTable;

    public paychecksEmail: Employee[] = [];
    public paychecksPrint: Employee[] = [];
    public employees$: BehaviorSubject<Employee[]> = new BehaviorSubject([]);
    public tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);

    constructor(
        private payrollrunService: PayrollrunService,
    ) {}

    public ngOnInit() {
        this.loadEmployeesInPayrollrun();
        this.setupPaycheckTable();
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
        const tmpEmail: Employee[] = [];
        const tmpPrint: Employee[] = [];

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
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text, false);
        const employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        const emailCol = new UniTableColumn(
            'BusinessRelationInfo.DefaultEmail.EmailAddress',
            'E-post',
            UniTableColumnType.Text,
            false);

        const typeCol = new UniTableColumn(
            '_paycheckFormat',
            'Type',
            UniTableColumnType.Select,
            (row) => this.typeColIsEditable(row))
            .setOptions({
                resource: [
                    PaycheckFormat.E_MAIL,
                    PaycheckFormat.PRINT
                ],
                itemTemplate: item => item
            });

        const config = new UniTableConfig('salary.payrollrun.sending.paychecks', true, true, 25)
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

    public resetRows() {
        this.resetRowSelection();
        this.rowSelectionChange();
    }

    public rowSelectionChange() {
        this.selectedEmps.next(this.getSelected());
    }

}
