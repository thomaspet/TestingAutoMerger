import {Component, ViewChild, OnInit, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {SalarytransFilter} from './salarytransFilter';
import {UniHttp} from '../../../../framework/core/http/http';
import {PayrollRun, Employee} from '../../../unientities';
import {EmployeeService, PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
declare var _;

@Component({
    selector: 'salarytrans',
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html'
})

export class SalaryTransactionSelectionList implements OnInit, AfterViewInit {
    private salarytransSelectionTableConfig: UniTableConfig;
    private selectedEmployeeID: number;
    private employeeList: Employee[];
    @Output() public changedPayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private disableFilter: boolean;
    public employees$: Observable<Employee[]>;
    public busy: boolean;
    @ViewChild(UniTable) private table: UniTable;
    private disableEmployeeList: boolean;
    private allReady: boolean;
    @Output() public salaryTransSelectionListReady: EventEmitter<any> = new EventEmitter<any>(true);

    constructor(private uniHttpService: UniHttp, private _employeeService: EmployeeService, private _payrollRunService: PayrollrunService) {
        
    }

    public ngOnInit() {
        this._payrollRunService.refreshPayrollRun$.subscribe((payrollRun: PayrollRun) => {
            payrollRun.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
        });
        this.tableConfig();
    }

    public ngAfterViewInit() {
        this.checkReady(true);
    }

    public checkReady(value) {
        if (this.allReady) {
            this.salaryTransSelectionListReady.emit(true);
        }
        this.allReady = true;
    }

    private tableConfig(update: boolean = false, filter = '') {
        this.employees$ = this._employeeService.GetAll(filter ? 'filter=' + filter : '', ['BusinessRelationInfo', 'SubEntity.BusinessRelationInfo', 'BankAccounts']);
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

            var employeenumberCol = new UniTableColumn('EmployeeNumber', '#', UniTableColumnType.Number).setWidth('5rem');
            var nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn', UniTableColumnType.Text);
            var lockedCol = new UniTableColumn('', '', UniTableColumnType.Custom)
                .setCls('icon-column')
                .setTemplate((rowModel: Employee) => {
                    if (rowModel.BankAccounts) {
                        let error = '';
                        let taxError = !rowModel.TaxTable && !rowModel.TaxPercentage;
                        let accountError = (!rowModel.BankAccounts) || !rowModel.BankAccounts.some(x => x.Active === true);
                        if (taxError || accountError) {
                            if (accountError && taxError) {
                                error = 'Skatteinfo og kontonummer mangler.';
                            } else if (accountError) {
                                error = 'Kontonummer mangler';
                            } else if (taxError) {
                                error = 'Skatteinfo mangler';
                            }
                            return '{#<em class="missing-info" href="/#/salary/employees/' + rowModel.ID + '" title="' + error + '" role="presentation">' + error + '</em>#}';
                        } else {
                            return "{#<em role='presentation'></em>#}# ";
                        }

                    } else {
                        return "{#<em class='missing-info' role='presentation'>Visible</em>#} ";
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
