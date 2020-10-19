import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Employee } from '@uni-entities';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniTableConfig, UniTableColumn } from '@uni-framework/ui/unitable';
import { IUniTab } from '@uni-framework/uni-tabs';
import { StatisticsService, ErrorService } from '@app/services/services';
import { EmailService } from '@app/services/common/emailService';
import { PayrollRunService } from '@app/components/salary/shared/services/payroll-run/payroll-run.service';
export enum PaycheckFormat {
    E_MAIL = 'E-post',
    PRINT = 'Utskrift'
}

@Component({
    selector: 'paycheck-sending',
    templateUrl: './paycheck-sending.component.html',
})
export class PaycheckSendingComponent implements OnInit, OnChanges {
    @ViewChild(AgGridWrapper, { static: true }) table: AgGridWrapper;
    @Input() employees: Employee[];
    @Input() runID: number;
    @Output() selectedEmps: EventEmitter<Employee[]> = new EventEmitter();

    emailCount: number = 0;
    printCount: number = 0;
    tableConfig: UniTableConfig;
    allEmployees: Employee[];
    empsWithoutEmail: Employee[];
    empsWithEmail: Employee[];
    tabs: IUniTab[];

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private emailService: EmailService
    ) {}

    ngOnChanges(): void {
        this.loadEmployeesInPayrollrun();
    }

    ngOnInit(): void {
        this.loadEmployeesInPayrollrun();
    }

    resetRows() {
        this.table.clearSelection();
    }

    rowSelectionChange(selectedEmployees?: Employee[]) {
        this.selectedEmps.next(selectedEmployees);
        this.emailCount = 0;
        this.printCount = 0;
        selectedEmployees.forEach(employee => {
            if (employee['_paycheckFormat'] === PaycheckFormat.E_MAIL) {
                this.emailCount++;
            } else {
                this.printCount++;
            }
        });
    }

    allEmps() {
        this.employees = this.allEmployees;
    }

    filterEmpsWithEmail() {
        this.employees = this.empsWithEmail;
    }

    filterEmpsWithoutEmail() {
        this.employees = this.empsWithoutEmail;
    }

    private loadEmployeesInPayrollrun() {
        if (!this.employees) {
            return;
        }

        this.employees.forEach(employee => {
            if (
                employee.BusinessRelationInfo &&
                employee.BusinessRelationInfo.DefaultEmail &&
                employee.BusinessRelationInfo.DefaultEmail.EmailAddress &&
                this.emailService.isValidEmailAddress(employee.BusinessRelationInfo.DefaultEmail.EmailAddress)
            ) {
                employee['_paycheckFormat'] = PaycheckFormat.E_MAIL;
            } else {
                employee['_paycheckFormat'] = PaycheckFormat.PRINT;
            }
            employee['_categories'] = '';
        });

        this.empsWithEmail = this.employees.filter(x => x['_paycheckFormat'] === PaycheckFormat.E_MAIL);
        this.empsWithoutEmail = this.employees.filter(x => x['_paycheckFormat'] === PaycheckFormat.PRINT);
        this.allEmployees = this.employees;

        this.tabs = [
            { name: 'Alle ansatte', onClick: () => this.allEmps(), count: this.allEmployees.length },
            { name: 'Med e-post', onClick: () => this.filterEmpsWithEmail(), count: this.empsWithEmail.length },
            { name: 'Uten e-post', onClick: () => this.filterEmpsWithoutEmail(), count: this.empsWithoutEmail.length }
        ];

        const filter = `model=EmployeeCategoryLink&select=EmployeeCategoryID as Number,EmployeeCategoryLink.EmployeeID as EmployeeID,category.Name as Name` +
            `&filter=trans.PayrollRunID eq ${this.runID}` +
            `&distinct=true` +
            `&join=EmployeeCategoryLink.EmployeeID eq SalaryTransaction.EmployeeID as trans and EmployeeCategoryLink.EmployeeCategoryID eq EmployeeCategory.ID as category`;

        this.statisticsService.GetAll(filter).subscribe(res => {
            if (res.Data && res.Data.length) {
                this.employees.map(emp => {
                    let string = '';
                    res.Data.filter(x => x.EmployeeID === emp.ID).map(
                        (x, i) => i === 0 ? string += `${x.Number} - ${x.Name}` : string += `, ${x.Number} - ${x.Name}`);

                    return emp['_categories'] = string;
                });
            }

            return this.setupPaycheckTable();
        },
        err => {
            this.setupPaycheckTable();
            return this.errorService.handle(err);
        });
    }

    private setupPaycheckTable() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer');
        const employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn');
        const emailCol = new UniTableColumn('BusinessRelationInfo.DefaultEmail.EmailAddress', 'E-post');
        const typeCol = new UniTableColumn('_paycheckFormat', 'Type');
        const categoryCol = new UniTableColumn('_categories', 'Kategori').setWidth('12rem').setVisible(false);

        this.tableConfig = new UniTableConfig('salary.payrollrun.sending.paychecks', false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol, categoryCol]);
    }
}
