import {Component, OnInit, Output, Input, ViewChild, EventEmitter, OnChanges} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType, ICellClickEvent} from '../../../../../framework/ui/unitable';
import {BehaviorSubject} from 'rxjs';
import {ReportDefinitionService, ErrorService} from '../../../../services/services';
import {Employee} from '../../../../unientities';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {UniModalService} from '../../../../../framework/uni-modal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniTab } from '@uni-framework/uni-tabs';

enum PaycheckFormat {
    E_MAIL = 'E-post',
    PRINT = 'Utskrift'
}

const PAYCHECK_FORMAT_KEY = '_paycheckFormat';

@Component({
  selector: 'uni-employee-report-picker-list',
  templateUrl: './employee-report-picker-list.component.html',
  styleUrls: ['./employee-report-picker-list.component.sass']
})
export class EmployeeReportPickerListComponent implements OnInit, OnChanges {

    @Input()
    public employees: Employee[];
    @Output()
    public busy: EventEmitter<boolean> = new EventEmitter();
    @Output()
    public selectedEmps: EventEmitter<number> = new EventEmitter();

    @ViewChild(AgGridWrapper, { static: true })
    public table: AgGridWrapper;

    public employeeTableData: Employee[] = [];
    public employeesWithEmail: Employee[] = [];
    public employeesWithoutEmail: Employee[] = [];
    public tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);
    public tabs: IUniTab[];

    constructor(
        private reportDefinitionService: ReportDefinitionService,
        private errorService: ErrorService,
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.setupTableSections();
        this.setupTable();
    }

    public ngOnChanges() {
        this.employeeTableData = [...this.handleEmployees(this.employees || [])];
    }

    private setupTable() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text, false);
        const employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text, false);
        const emailCol = new UniTableColumn(
            'BusinessRelationInfo.DefaultEmail.EmailAddress',
            'E-post',
            UniTableColumnType.Text,
            false);

        const typeCol = new UniTableColumn('_paycheckFormat', 'Type', UniTableColumnType.Text,
            (row: Employee) => this.employeeHasAddress(row));

        let pageSize = window.innerHeight - 520;

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        const config = new UniTableConfig('salary.common.employee-report-picker-list', false, true, pageSize)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol]);

        this.tableConfig$.next(config);
    }

    private setupTableSections(): void {
        this.tabs = [
            { name: 'Alle ansatte', onClick: () => this.setAllEmployees() },
            { name: 'Med e-post', onClick: () => this.setEmployeessWithEmail(), count: 0},
            { name: 'Uten e-post', onClick: () => this.setEmployeesWithoutEmail(), count: 0}
        ];
    }

    setAllEmployees() {
        this.employeeTableData = this.employees;
    }

    setEmployeessWithEmail() {
        this.employeeTableData = this.employeesWithEmail;
    }

    setEmployeesWithoutEmail() {
        this.employeeTableData = this.employeesWithoutEmail;
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
        employees.forEach(employee => {
            employee[PAYCHECK_FORMAT_KEY] = this.employeeHasAddress(employee)
                ? PaycheckFormat.E_MAIL
                : PaycheckFormat.PRINT;

            if (employee[PAYCHECK_FORMAT_KEY] === PaycheckFormat.E_MAIL) {
                this.employeesWithEmail.push(employee);
            } else {
                this.employeesWithoutEmail.push(employee);
            }

            this.tabs[1].count = this.employeesWithEmail.length || 0;
            this.tabs[2].count = this.employeesWithoutEmail.length || 0;

            return employee;
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
