import {Component, OnInit, Output, Input, ViewChild, EventEmitter, OnChanges} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../../framework/ui/unitable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReportDefinitionService, ErrorService} from '../../../../services/services';
import {Employee} from '../../../../unientities';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {UniModalService} from '../../../../../framework/uniModal/barrel';

enum PaycheckFormat {
    E_MAIL = 'Epost',
    PRINT = 'Utskrift'
}

const PAYCHECK_FORMAT_KEY = '_paycheckFormat';

@Component({
  selector: 'uni-employee-report-picker-list',
  templateUrl: './employee-report-picker-list.component.html',
  styleUrls: ['./employee-report-picker-list.component.sass']
})
export class EmployeeReportPickerListComponent implements OnInit, OnChanges {

    @Input() public employees: Employee[];
    @Output() public busy: EventEmitter<boolean> = new EventEmitter();
    @Output() public selectedEmps: EventEmitter<number> = new EventEmitter();
    @ViewChild(UniTable) public table: UniTable;

    public tableEmps$: BehaviorSubject<Employee[]> = new BehaviorSubject<Employee[]>([]);
    private emailEmps: Employee[] = [];
    private printEmps: Employee[] = [];
    private tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);
    constructor(
        private reportDefinitionService: ReportDefinitionService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.setupTable();
    }

    public ngOnChanges() {
        this.tableEmps$.next(this.handleEmployees(this.employees || []));
    }

    private setupTable() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text, false);
        const employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        const emailCol = new UniTableColumn(
            'BusinessRelationInfo.DefaultEmail.EmailAddress',
            'Epost',
            UniTableColumnType.Text,
            false);

        const typeCol = new UniTableColumn(
            '_paycheckFormat',
            'Type',
            UniTableColumnType.Select,
            (row: Employee) => this.employeeHasAddress(row))
            .setOptions({
                resource: [
                    PaycheckFormat.E_MAIL,
                    PaycheckFormat.PRINT
                ],
                itemTemplate: item => item
            });

        const config = new UniTableConfig('salary.common.employee-report-picker-list', true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol]);

        this.tableConfig$.next(config);
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

    private employeeHasAddress(row: Employee): boolean {
        return !!(row.BusinessRelationInfo
            && row.BusinessRelationInfo.DefaultEmail
            && row.BusinessRelationInfo.DefaultEmail.EmailAddress);
    }

    private handleEmployees(employees: Employee[]) {
        employees.forEach(emp => {
            emp[PAYCHECK_FORMAT_KEY] = this.employeeHasAddress(emp)
                ? PaycheckFormat.E_MAIL
                : PaycheckFormat.PRINT;

            if (emp[PAYCHECK_FORMAT_KEY] === PaycheckFormat.E_MAIL) {
                this.emailEmps.push(emp);
            } else {
                this.printEmps.push(emp);
            }

            return emp;
        });

        return employees;
    }

    public resetRows() {
        this.resetRowSelection();
        this.rowSelectionChange();
    }

    public rowSelectionChange() {
        this.selectedEmps.next(this.getSelected().length);
    }

    public getSelectedMailEmployees(): Employee[] {
        return this.getSelected()
            .filter(emp => emp['_paycheckFormat'] === PaycheckFormat.E_MAIL);
    }

    public getSelectedPrintEmployees(): Employee[] {
        return this.getSelected()
            .filter(emp => emp['_paycheckFormat'] === PaycheckFormat.PRINT);
    }

    public printReport(reportName: string, params: {Name: string, value: any} []) {
        this.reportDefinitionService
        .getReportByName(reportName)
        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
        .subscribe((report) => {
            if (!report) {
                return;
            }

            report.parameters = params;

            this.modalService.open(UniPreviewModal, {data: report});
        });
    }

}
