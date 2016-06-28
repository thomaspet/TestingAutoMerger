import {Component, ViewChild, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {SalarytransFilter} from './salarytransFilter';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, Employee} from '../../../unientities';
import {EmployeeService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
declare var _;

@Component({
    selector: 'salarytrans',
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html',
    directives: [UniTable, SalaryTransactionEmployeeList, SalarytransFilter],
    providers: [EmployeeService],
    pipes: [AsyncPipe]
})

export class SalaryTransactionSelectionList implements OnInit {
    private salarytransSelectionTableConfig: UniTableConfig;
    private selectedEmployeeID: number;
    private employeeList: Employee[];
    @Input() private selectedPayrollRun: PayrollRun;
    @Output() public changedPayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private disableFilter: boolean;
    public employees$: Observable<Employee[]>;
    public busy: boolean;
    @ViewChild(UniTable) private table: UniTable;
    private disableEmployeeList: boolean;

    constructor(private uniHttpService: UniHttp, private _employeeService: EmployeeService) {
    }

    public ngOnInit() {
        this.selectedPayrollRun.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
        this.tableConfig();
    }

    private tableConfig(update: boolean = false, filter = '') {
        this.employees$ = this._employeeService.GetAll(filter ? 'filter=' + filter : '', ['BusinessRelationInfo', 'SubEntity.BusinessRelationInfo, BankAccounts']);
        this.employees$.subscribe((employees) => {
            this.employeeList = employees;
            if (!update && this.employeeList) {
                this.selectedEmployeeID = this.employeeList[0].ID;
            }
        }, (error: any) => {
            this.log(error);
            console.log(error);
        });
        if (!update) {

            var employeenumberCol = new UniTableColumn('EmployeeNumber', '#', UniTableColumnType.Number).setWidth('2rem');
            var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);
            var lockedCol = new UniTableColumn('', '', UniTableColumnType.Custom)
                .setCls('icon-column')
                .setTemplate((rowModel: Employee) => {
                    if (rowModel.TaxTable === null || !rowModel.BankAccounts.some(x => x.Active === true)) {
                        return "{#<em class='missing-info' role='presentation'>Visible</em>#} ";
                    } else {
                        return "{#<em role='presentation'></em>#}# ";
                    }
                })
                .setWidth('2rem');

            var subEntityCol = new UniTableColumn('SubEntity.BusinessRelationInfo.Name', 'Virksomhet', UniTableColumnType.Text);
            this.salarytransSelectionTableConfig = new UniTableConfig(false)
                .setColumnMenuVisible(false)
                .setColumns([
                    employeenumberCol,
                    nameCol,
                    subEntityCol,
                    lockedCol
                ]);
        }
        this.disableEmployeeList = false;
    }
    public rowSelected(event) {
        this.selectedEmployeeID = event.rowModel.ID;
    }

    public goToNextEmployee(id) {
        var index = _.findIndex(this.employeeList, x => x.ID === this.selectedEmployeeID);
        if (index + 1 < this.employeeList.length) {
            this.selectedEmployeeID = this.employeeList[index + 1].ID;
            this.employees$ = _.cloneDeep(this.employees$);
        }
    }

    public goToPreviousEmployee(id) {
        var index = _.findIndex(this.employeeList, x => x.ID === this.selectedEmployeeID);
        if (index > 0) {
            this.selectedEmployeeID = this.employeeList[index - 1].ID;
            this.employees$ = _.cloneDeep(this.employees$);
        }
    }

    public changeFilter(filter: string) {
        this.tableConfig(true, filter);
        this.selectedEmployeeID = 0;
    }

    public payrollRunChanged() {
        this.changedPayrollRun.emit(true);
    }

    public saveRun(event: any) {
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }
}
