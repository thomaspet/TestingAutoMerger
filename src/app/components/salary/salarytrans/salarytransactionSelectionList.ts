import { Component, ViewChild, Output, EventEmitter, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn, IContextMenuItem } from 'unitable-ng2/main';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, AGAZone, SalaryTransactionSums, PayrollRun, EmployeeTaxCard, SalBalType } from '../../../unientities';
import { ISummaryConfig } from '../../common/summary/summary';
import { UniView } from '../../../../framework/core/uniView';
import { SalaryTransactionEmployeeList } from './salarytransList';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import {
    EmployeeService,
    PayrollrunService,
    UniCacheService,
    AgaZoneService,
    NumberFormat,
    ErrorService,
    SalarySumsService
} from '../../../services/services';

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
    private payrollRun: PayrollRun;
    private summary: ISummaryConfig[] = [];
    private contextMenu$: ReplaySubject<IContextMenuItem[]>;

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
        private _salarySumsService: SalarySumsService,
        private numberFormat: NumberFormat,
        private route: ActivatedRoute,
        private router: Router,
        protected cacheService: UniCacheService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);

        this.tableConfig();

        this.contextMenu$ = new ReplaySubject<IContextMenuItem[]>(1);

        route.params.subscribe(param => {
            this.payrollRunID = +param['id'];
            super.updateCacheKey(router.url);
            super.getStateSubject('employees').subscribe((employees: Employee[]) => {
                this.selectedIndex = 0;
                this.employeeList = _.cloneDeep(employees) || [];

                if (this.employeeList && this.employeeList.length) {
                    this.focusRow(0);
                }
            });
            super.getStateSubject('payrollRun').subscribe((payrollRun: PayrollRun) => {
                this.payrollRun = payrollRun;
                this.contextMenu$.next(this.generateContextMenu(payrollRun));
            });
        });
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    private generateContextMenu(payrollRun: PayrollRun): IContextMenuItem[] {
        let items = [
            { label: 'Forskudd', action: () => this.navigateToNewAdvance() },
            { label: 'Trekk', action: () => this.navigateToNewDraw() },
            { label: 'Saldooversikt', action: () => this.navigateToSalaryBalanceList() }
        ];
        if (payrollRun.StatusCode > 0) {
            items.push({ label: 'Tilleggsopplysninger', action: () => this.navigateToSupplements() });
        }
        return items;
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
                let error = '';
                let taxError = !rowModel.TaxCards
                    || !rowModel.TaxCards.length
                    || (!rowModel.TaxCards[0].TaxTable
                        && !rowModel.TaxCards[0].TaxPercentage);
                let accountError = !rowModel.BusinessRelationID
                    || !rowModel.BusinessRelationInfo.DefaultBankAccountID;
                let notUpdated = !taxError
                    && rowModel.TaxCards
                    && this.payrollRun
                    && rowModel.TaxCards[0].Year < new Date(this.payrollRun.PayDate).getFullYear();

                if (taxError || accountError || notUpdated) {
                    if (accountError && taxError) {
                        error = 'Skatteinfo og kontonummer mangler.';
                    } else if (accountError) {
                        error = 'Kontonummer mangler. ';
                    } else if (taxError) {
                        error = 'Skatteinfo mangler. ';
                    }
                    if (notUpdated) {
                        error += 'Skattekort er ikke oppdatert';
                    }
                    return '{#<em class="missing-info" title="'
                        + error
                        + '" role="presentation">'
                        + error
                        + '</em>#}';
                } else {
                    return "{#<em role='presentation'></em>#}# ";
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
        this.setSums(null);
        this.setSummarySource();
    }

    private getAga() {
        let employee = this.employeeList[this.selectedIndex];
        if (employee.SubEntity) {
            let obs = !this.agaZone || (employee.SubEntity.AgaZone !== this.agaZone.ID)
                ? this._agaZoneService
                    .Get(employee.SubEntity.AgaZone)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                : Observable.of(this.agaZone);

            obs.subscribe((agaResponse: AGAZone) => {
                this.agaZone = agaResponse;
            });
        } else {
            this.agaZone = new AGAZone();
        }
    }

    private setSums(employeeTotals: SalaryTransactionSums) {
        let employee = this.employeeList[this.selectedIndex];
        let taxCard = employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;

        this.summary = [{
            value: employeeTotals && this.numberFormat.asMoney(employeeTotals.percentTax),
            title: `Prosenttrekk` + (taxCard ? ` (${taxCard.TaxPercentage}%)` : ''),
            description: employeeTotals
                && employeeTotals.basePercentTax
                ? `av ${this.numberFormat.asMoney(employeeTotals.basePercentTax)}` : null
        }, {
            value: employeeTotals && this.numberFormat.asMoney(employeeTotals.tableTax),
            title: 'Tabelltrekk' + (taxCard ? ` (${taxCard.TaxTable})` : ''),
            description: employeeTotals
                && employeeTotals.baseTableTax
                ? `av ${this.numberFormat.asMoney(employeeTotals.baseTableTax)}` : null
        }, {
            title: 'Utbetalt beløp',
            value: employeeTotals && this.numberFormat.asMoney(employeeTotals.netPayment)
        }, {
            title: 'Beregnet AGA',
            value: employeeTotals ? this.numberFormat.asMoney(employeeTotals.calculatedAGA) : null
        }, {
            title: 'Gr.lag feriepenger',
            value: employeeTotals ? this.numberFormat.asMoney(employeeTotals.baseVacation) : null
        }];
    }

    private setSummarySource() {
        if (this.payrollRunID > 0 && this.employeeList[this.selectedIndex]) {
            this._salarySumsService
                .getFromPayrollRun(this.payrollRunID, `EmployeeID eq ${this.employeeList[this.selectedIndex].ID}`)
                .debounceTime(200)
                .subscribe(
                employeeTotals => this.setSums(employeeTotals),
                err => this.errorService.handle(err));
        }
    }

    private getTaxcard(employee: Employee): EmployeeTaxCard {
        return employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
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

    public generateErrorMessage(): string {
        let employee: Employee = this.employeeList[this.selectedIndex];
        let taxCard = this.getTaxcard(employee);
        let error = 
            `Gå til <a href="/#/salary/employees/${employee.ID}"> ansattkortet ${employee.BusinessRelationInfo 
            ? 'for' + employee.BusinessRelationInfo.Name 
            : ''}</a> for å legge inn `;
        let noBankAccounts = !employee.BusinessRelationID || !employee.BusinessRelationInfo.DefaultBankAccountID;
        let noTax = !taxCard || !taxCard.TaxTable && !taxCard.TaxPercentage;

        if (noBankAccounts && noTax) {
            error = 'Skatteinfo og kontonummer mangler. ' + error + 'skatteinfo og kontonummer.';
        } else if (noBankAccounts) {
            error = 'Kontonummer mangler. ' + error + 'kontonummer.';
        } else if (noTax) {
            error = 'Skatteinfo mangler. ' + error + 'skatteinfo.';
        }

        return error;
    }

    public generateWarningMessage(): string {
        let employee = this.employeeList[this.selectedIndex];
        let taxCard = this.getTaxcard(employee);
        let noTax = !taxCard || !taxCard.TaxTable && !taxCard.TaxPercentage;
        let notUpdated = !noTax && this.payrollRun && taxCard.Year < new Date(this.payrollRun.PayDate).getFullYear();
        let ret: string = '';
        if (notUpdated) {
            ret += 'Skattekort er ikke oppdatert.';

            if (!this.hasError()) {
                ret += ` Gå til <a href="/#/salary/employees/${employee.ID}"> ansattkortet for ${employee.BusinessRelationInfo.Name}</a> for å oppdatere skattekort.`;
            }
        }
        return ret;
    }

    public hasWarning(): boolean {
        let employee = this.employeeList[this.selectedIndex];
        let taxCard = this.getTaxcard(employee);
        let noTax = !taxCard || !taxCard.TaxTable && !taxCard.TaxPercentage;
        return !noTax && this.payrollRun && taxCard.Year < new Date(this.payrollRun.PayDate).getFullYear();
    }

    public hasError(): boolean {
        let employee: Employee = this.employeeList[this.selectedIndex];
        let taxCard = employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
        let noBankAccounts = !employee.BusinessRelationID || !employee.BusinessRelationInfo.DefaultBankAccountID;
        let noTax = !taxCard || !taxCard.TaxTable && !taxCard.TaxPercentage;

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


    public navigateToNewAdvance() {
        let employee = this.employeeList[this.selectedIndex];
        if (employee) {
            this.router
                .navigate([`salary/salarybalances/0/details`,
                    { employeeID: employee.ID, instalmentType: SalBalType.Advance }]);
        }
    }

    public navigateToNewDraw() {
        let employee = this.employeeList[this.selectedIndex];
        if (employee) {
            this.router
                .navigate([`salary/salarybalances/0/details`, { employeeID: employee.ID }]);
        }
    }

    public navigateToSalaryBalanceList() {
        let employee = this.employeeList[this.selectedIndex];
        if (employee) {
            this.router
                .navigate(['salary/salarybalances', { empID: employee.ID }]);
        }
    }

    public navigateToSupplements() {
        this.router
            .navigate(['salary/supplements',
                { runID: this.payrollRunID }]);
    }
}
