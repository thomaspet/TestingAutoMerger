import {Component, OnInit, Output, Input, ViewChild, EventEmitter, OnChanges} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { IUniTab } from '@uni-framework/uni-tabs';
import { StatisticsService, ReportDefinitionService, ErrorService } from '@app/services/services';
import { Employee } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { UniModalService, UniPreviewModal } from '@uni-framework/uni-modal';
import { IReportPickerEmployee, PaycheckFormat } from '../../services/employee-report-picker/employee-report-picker.service';

const PAYCHECK_FORMAT_KEY = '_paycheckFormat';

@Component({
  selector: 'uni-employee-report-picker-list',
  templateUrl: './employee-report-picker-list.component.html',
  styleUrls: ['./employee-report-picker-list.component.sass']
})
export class EmployeeReportPickerListComponent implements OnInit, OnChanges {

    @Input()
    public employees: IReportPickerEmployee[];
    @Output()
    public busy: EventEmitter<boolean> = new EventEmitter();
    @Output()
    public selectedEmps: EventEmitter<number> = new EventEmitter();

    @ViewChild(AgGridWrapper, { static: true })
    public table: AgGridWrapper;

    public employeeTableData: IReportPickerEmployee[] = [];
    public employeesWithEmail: IReportPickerEmployee[] = [];
    public employeesWithoutEmail: IReportPickerEmployee[] = [];
    public tableConfig$: BehaviorSubject<UniTableConfig> = new BehaviorSubject(null);
    public tabs: IUniTab[];
    private categoriesList: [{Number: number, EmployeeID: number, Name: string}];

    constructor(
        private reportDefinitionService: ReportDefinitionService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private statisticsService: StatisticsService
    ) { }

    public ngOnInit() {
        this.setCategories().subscribe(res => {
            this.categoriesList = res;
            if ( this.categoriesList.length > 0) {
                this.setupTable();
            }
        });
        this.setupTableSections();
        this.setupTable();
    }

    public ngOnChanges() {
        this.employeeTableData = this.employees;
        this.UpdateTable();
    }

    private setupTable() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer', UniTableColumnType.Text, false);
        const employeenameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text, false);
        const emailCol = new UniTableColumn(
            'EMail',
            'E-post',
            UniTableColumnType.Text,
            false);
        const typeCol = new UniTableColumn('_paycheckFormat', 'Type', UniTableColumnType.Text,
            (row: Employee) => this.employeeHasAddress(row));
        const categoryColumn = new UniTableColumn('_categories', 'Kategori').setWidth('12rem').setVisible(false);

        let pageSize = window.innerHeight - 520;

        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        const config = new UniTableConfig('salary.common.employee-report-picker-list', false, true, pageSize)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol, categoryColumn]);

        this.tableConfig$.next(config);
    }

    private setupTableSections(): void {
        this.tabs = [
            { name: 'Alle ansatte', onClick: () => this.setAllEmployees() },
            { name: 'Med e-post', onClick: () => this.setEmployeessWithEmail(), count: 0},
            { name: 'Uten e-post', onClick: () => this.setEmployeesWithoutEmail(), count: 0}
        ];
    }

    private setCategories(): Observable<any> {
        const filter =
                `model=EmployeeCategoryLink&select=EmployeeCategoryID as ` +
                `Number,EmployeeCategoryLink.EmployeeID as EmployeeID,category.Name as Name` +
                `&distinct=true` +
                `&join=EmployeeCategoryLink.EmployeeID eq SalaryTransaction.EmployeeID` +
                ` as trans and EmployeeCategoryLink.EmployeeCategoryID eq EmployeeCategory.ID as category`;

        return this.statisticsService.GetAllUnwrapped(filter);
    }

    private linkCatagoriesWithEmployee(): void {
        if (this.categoriesList && this.categoriesList.length) {
            this.employees.forEach(employee => {
                let string = '';
                this.categoriesList.forEach(category => {
                    if (category.EmployeeID === employee.ID) {
                        string += string.length > 0 ? `, ${category.Number} - ${category.Name}` : `${category.Number} - ${category.Name}`;
                    }
                });
                employee['_categories'] = string;
            });
        }
    }

    private setAllEmployees(): void {
        this.employeeTableData = this.employees;
    }

    private setEmployeessWithEmail(): void {
        this.employeeTableData = this.employeesWithEmail;
    }

    private setEmployeesWithoutEmail(): void {
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

    private getSelected(): IReportPickerEmployee[] {
        return this.table.getSelectedRows();
    }

    private employeeHasAddress(row: Employee): boolean {
        return !!(row.BusinessRelationInfo
            && row.BusinessRelationInfo.DefaultEmail
            && row.BusinessRelationInfo.DefaultEmail.EmailAddress);
    }

    private UpdateTable(): void {
        this.linkCatagoriesWithEmployee();
        this.employees.forEach(employee => {
            employee._paycheckFormat = employee?.EMail
                ? PaycheckFormat.E_MAIL
                : PaycheckFormat.PRINT;

            if (employee._paycheckFormat === PaycheckFormat.E_MAIL) {
                this.employeesWithEmail.push(employee);
            } else {
                this.employeesWithoutEmail.push(employee);
            }

            this.tabs[1].count = this.employeesWithEmail.length || 0;
            this.tabs[2].count = this.employeesWithoutEmail.length || 0;

            return employee;
        });
    }

    public resetRows() {
        this.resetRowSelection();
        this.rowSelectionChange();
    }

    public rowSelectionChange() {
        this.selectedEmps.next(this.getSelected().length);
    }

    public getSelectedMailEmployees(): IReportPickerEmployee[] {
        return this.getSelected()
            .filter(emp => emp['_paycheckFormat'] === PaycheckFormat.E_MAIL);
    }

    public getSelectedPrintEmployees(): IReportPickerEmployee[] {
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
