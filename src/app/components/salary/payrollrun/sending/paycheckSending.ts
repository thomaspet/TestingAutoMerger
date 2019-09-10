import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {Employee} from '@uni-entities';
import {PayrollrunService} from '@app/services/services';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniTableConfig, UniTableColumn} from '@uni-framework/ui/unitable';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

export enum PaycheckFormat {
    E_MAIL = 'E-post',
    PRINT = 'Utskrift'
}

@Component({
    selector: 'paycheck-sending',
    templateUrl: './paycheckSending.html',
})
export class PaycheckSending implements OnInit {
    @ViewChild(AgGridWrapper) table: AgGridWrapper;

    @Input() runID: number;
    @Output() selectedEmps: EventEmitter<Employee[]> = new EventEmitter();

    emailCount: number = 0;
    printCount: number = 0;
    employees: Employee[];
    tableConfig: UniTableConfig;
    allEmployees: Employee[];
    empsWithoutEmail: Employee[];
    empsWithEmail: Employee[];
    tabs: IUniTab[];

    constructor(private payrollrunService: PayrollrunService) {}

    ngOnInit() {
        this.loadEmployeesInPayrollrun();
        this.setupPaycheckTable();
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
        this.payrollrunService.getEmployeesOnPayroll(
            this.runID, ['BusinessRelationInfo', 'BusinessRelationInfo.DefaultEmail']
        ).subscribe((employees: Employee[]) => {
            employees.forEach(employee => {
                if (
                    employee.BusinessRelationInfo &&
                    employee.BusinessRelationInfo.DefaultEmail &&
                    employee.BusinessRelationInfo.DefaultEmail.EmailAddress
                ) {
                    employee['_paycheckFormat'] = PaycheckFormat.E_MAIL;
                } else {
                    employee['_paycheckFormat'] = PaycheckFormat.PRINT;
                }
            });

            this.empsWithEmail = employees.filter(x => x['_paycheckFormat'] === PaycheckFormat.E_MAIL);
            this.empsWithoutEmail = employees.filter(x => x['_paycheckFormat'] === PaycheckFormat.PRINT);
            this.employees = employees;
            this.allEmployees = employees;

            this.tabs = [
                { name: 'Alle ansatte', onClick: () => this.allEmps(), count: this.allEmployees.length },
                { name: 'Med e-post', onClick: () => this.filterEmpsWithEmail(), count: this.empsWithEmail.length },
                { name: 'Uten e-post', onClick: () => this.filterEmpsWithoutEmail(), count: this.empsWithoutEmail.length }
            ];
        });
    }

    private setupPaycheckTable() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', 'Ansattnummer');
        const employeenameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn');
        const emailCol = new UniTableColumn('BusinessRelationInfo.DefaultEmail.EmailAddress', 'E-post');
        const typeCol = new UniTableColumn('_paycheckFormat', 'Type');

        this.tableConfig = new UniTableConfig('salary.payrollrun.sending.paychecks', false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([employeenumberCol, employeenameCol, emailCol, typeCol]);
    }
}
