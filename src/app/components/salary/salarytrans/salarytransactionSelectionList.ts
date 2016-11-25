import { Component, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, AGAZone, SalaryTransactionSums } from '../../../unientities';
import { EmployeeService, PayrollrunService, UniCacheService, AgaZoneService, NumberFormat } from '../../../services/services';
import { ISummaryConfig } from '../../common/summary/summary';

import { UniView } from '../../../../framework/core/uniView';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {ErrorService} from '../../../services/common/ErrorService';
declare var _;

@Component({
    selector: 'salarytrans',
    templateUrl: 'app/components/salary/salarytrans/salarytransactionSelectionList.html'
})

export class SalaryTransactionSelectionList extends UniView implements AfterViewInit {
    private salarytransSelectionTableConfig: UniTableConfig;
    private employeeList: Employee[] = [];
    private selectedIndex: number = 0;
    private agaZone: AGAZone;
    private payrollRunID: number;

    private employeeTotals: SalaryTransactionSums;
    private summary: ISummaryConfig[] = [];

    @Output() public changedPayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    public busy: boolean;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SalaryTransactionEmployeeList) private transList: SalaryTransactionEmployeeList;
    @Output() public salaryTransSelectionListReady: EventEmitter<any> = new EventEmitter<any>(true);

    constructor(
        private uniHttpService: UniHttp,
        private _employeeService: EmployeeService,
        private _payrollRunService: PayrollrunService,
        private _agaZoneService: AgaZoneService,
        private numberFormat: NumberFormat,
        private route: ActivatedRoute,
        private router: Router,
        protected cacheService: UniCacheService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);

        this.tableConfig();
        
        route.params.subscribe(param => {
            this.payrollRunID = +param['id'];
            super.updateCacheKey(router.url);
            super.getStateSubject('employees').subscribe((employees: Employee[]) => {
                
                this.selectedIndex = 0;
                this.employeeList = employees || [];

                this.focusRow(0);

                if (this.employeeList && this.employeeList.length) {
                    this.getAga();
                    this.employeeTotals = null;
                    this.setSums();
                    this.setSummarySource();
                }
            });
        });
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    public focusRow(index = undefined) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    private tableConfig() {

        var employeenumberCol = new UniTableColumn('EmployeeNumber', '#', UniTableColumnType.Number).setWidth('3rem');
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

        this.salarytransSelectionTableConfig = new UniTableConfig(false)
            .setColumnMenuVisible(false)
            .setColumns([
                employeenumberCol,
                nameCol,
                lockedCol
            ]);
    }



    public rowSelected(event) {
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.getAga();
        this.employeeTotals = null;
        this.setSums();
        this.setSummarySource();
    }

    private getAga() {
        let employee = this.employeeList[this.selectedIndex];
        if (!this.agaZone || (employee.SubEntity && employee.SubEntity.AgaZone !== this.agaZone.ID) ) {
            this._agaZoneService
                .Get(employee.SubEntity.AgaZone)
                .subscribe((agaResponse: AGAZone) => {
                    this.agaZone = agaResponse;
                }, this.errorService.handle);
        } else if (!employee.SubEntity) {
            this.agaZone = new AGAZone();
        }
    }

    private setSums() {

        this.summary = [{
            value: this.employeeTotals && this.numberFormat.asMoney(this.employeeTotals.percentTax),
            title: 'Prosenttrekk',
            description: this.employeeTotals && this.employeeTotals.basePercentTax ? `av ${this.numberFormat.asMoney(this.employeeTotals.basePercentTax)}` : null
        }, {
            value: this.employeeTotals && this.numberFormat.asMoney(this.employeeTotals.tableTax),
            title: 'Tabelltrekk',
            description: this.employeeTotals && this.employeeTotals.baseTableTax ? `av ${this.numberFormat.asMoney(this.employeeTotals.baseTableTax)}` : null
        }, {
            title: 'Utbetalt beløp',
            value: this.employeeTotals && this.numberFormat.asMoney(this.employeeTotals.netPayment)
        }, {
            title: 'Beregnet AGA',
            value: this.employeeTotals ? this.numberFormat.asMoney(this.employeeTotals.calculatedAGA) : null
        }, {
            title: 'Grunnlag feriepenger',
            value: this.employeeTotals ? this.numberFormat.asMoney(this.employeeTotals.baseVacation) : null
        }];
    }

    private setSummarySource() {
        this._employeeService.getTotals(this.payrollRunID, this.employeeList[this.selectedIndex].ID)
            .subscribe((response) => {
                if (response) {
                    this.employeeTotals = response;
                    this.setSums();
                }
            }, this.errorService.handle);
    }

    public goToNextEmployee() {
        var index = _.findIndex(this.employeeList, x => x.ID === this.employeeList[this.selectedIndex].ID);
        if (index + 1 < this.employeeList.length) {
            this.selectedIndex = index + 1;
            this.focusRow(this.selectedIndex);
        }
    }

    public goToPreviousEmployee() {
        var index = _.findIndex(this.employeeList, x => x.ID === this.employeeList[this.selectedIndex].ID);
        if (index > 0) {
            this.selectedIndex = index - 1;
            this.focusRow(this.selectedIndex);
        }
    }

    public saveRun(event: any) {
    }

    public noActiveBankAccounts(): boolean {
        return !this.employeeList[this.selectedIndex].BankAccounts.some(x => x.Active === true);
    }

    public generateErrorMessage(): string {
        let employee: Employee = this.employeeList[this.selectedIndex];
        let error = `Gå til <a href="/#/salary/employees/${employee.ID}"> ansattkortet for ${employee.BusinessRelationInfo.Name}</a> for å legge inn `;
        let noBankAccounts = (!employee.BankAccounts) || this.noActiveBankAccounts();
        let noTax = !employee.TaxTable && !employee.TaxPercentage;

        if (noBankAccounts && noTax) {
            error = 'Skatteinfo og kontonummer mangler. ' + error + 'skatteinfo og kontonummer.';
        } else if (noBankAccounts) {
            error = 'Kontonummer mangler. ' + error + 'kontonummer.';
        } else if (noTax) {
            error = 'Skatteinfo mangler. ' + error + 'skatteinfo.';
        }

        return error;
    }

    public hasError(): boolean {
        let employee: Employee = this.employeeList[this.selectedIndex];
        let noBankAccounts = (!employee.BankAccounts) || this.noActiveBankAccounts();
        let noTax = !employee.TaxTable && !employee.TaxPercentage;

        return noBankAccounts || noTax;
    }

    public hasDirty(): boolean {
        return this.transList ? this.transList.hasDirty() : false;
    }

    public updateSums() {
        this.setSummarySource();
    }

    public setEditable(isEditable: boolean) {
        this.transList.setEditable(isEditable);
    }
}
