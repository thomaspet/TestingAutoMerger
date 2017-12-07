import {Component, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {
    UniTable, UniTableConfig, UniTableColumnType,
    UniTableColumn
} from '../../../../framework/ui/unitable/index';
import {UniHttp} from '../../../../framework/core/http/http';
import {
    Employee, AGAZone, SalaryTransactionSums,
    PayrollRun, EmployeeTaxCard, SalBalType, ValidationLevel} from '../../../unientities';
import {ISummaryConfig} from '../../common/summary/summary';
import {UniView} from '../../../../framework/core/uniView';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {ILinkMenuItem} from '../../common/linkMenu/linkMenu';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';
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
    templateUrl: './salarytransactionSelectionList.html'
})

export class SalaryTransactionSelectionList extends UniView implements AfterViewInit {
    private salarytransSelectionTableConfig: UniTableConfig;
    private employeeList: Employee[] = [];
    private selectedIndex: number = 0;
    private agaZone: AGAZone;
    private payrollRunID: number;
    private payrollRun: PayrollRun;
    private summary: ISummaryConfig[] = [];
    private linkMenu$: ReplaySubject<ILinkMenuItem[]>;

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

        this.linkMenu$ = new ReplaySubject<ILinkMenuItem[]>(1);

        route.params.subscribe(param => {
            this.payrollRunID = +param['id'];
            super.updateCacheKey(router.url);
            super.getStateSubject('employees')
                .do(() => this.selectedIndex = 0)
                .do(employees => this.linkMenu$
                    .next(this.generateLinkMenu(this.payrollRun, employees[this.selectedIndex])))
                .subscribe((employees: Employee[]) => {
                this.employeeList = _.cloneDeep(employees) || [];

                if (this.employeeList && this.employeeList.length) {
                    this.focusRow(0);
                }
            });

            super.getStateSubject('payrollRun')
                .do(payrollRun => this.linkMenu$
                    .next(this.generateLinkMenu(payrollRun, this.employeeList[this.selectedIndex])))
                .subscribe((payrollRun: PayrollRun) => {
                this.payrollRun = payrollRun;
            });
        });
    }

    public ngAfterViewInit() {
        this.focusRow(0);
    }

    private generateLinkMenu(payrollRun: PayrollRun, employee: Employee): ILinkMenuItem[] {
        let items: ILinkMenuItem[] = [];
        if (employee) {
            items = [
                ...items,
                { label: 'Forskudd', link: this.createNewAdvanceLink(employee.ID) },
                { label: 'Trekk', link: this.createNewDrawLink(employee.ID) },
                { label: 'Saldooversikt', link: this.createSalaryBalanceListLink(employee.ID) }
            ];
            if (this.hasError(employee)) {
                const error = this.generateEmployeeError(employee);
                items.unshift(
                    { label: error, link: this.createEmployeeLink(employee.ID), validation: ValidationLevel.Error }
                );
            }
        }

        if (payrollRun) {
            if (payrollRun.StatusCode > 0) {
                items.push({ label: 'Tilleggsopplysninger', link: this.createSupplementsLink(payrollRun.ID) });
            }
        }

        return items;
    }

    public focusRow(index?) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    private tableConfig() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', '#')
            .setWidth('3rem');
        const nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn')
            .setTooltip(rowModel => {
                const error = this.generateEmployeeError(rowModel);
                if (error) {
                    return {
                        type: 'bad',
                        text: error
                    };
                }
            });

        this.salarytransSelectionTableConfig = new UniTableConfig('salary.salarytrans.selectionList', false)
            .setColumnMenuVisible(false)
            .setDefaultOrderBy('EmployeeNumber', 1)
            .setColumns([
                employeenumberCol,
                nameCol,
            ]);
    }

    private generateEmployeeError(employee: Employee): string {
        let error = '';
        let taxError = !employee.TaxCards
            || !employee.TaxCards.length
            || (!employee.TaxCards[0].Table
                && !employee.TaxCards[0].Percent);
        let accountError = !employee.BusinessRelationID
            || !employee.BusinessRelationInfo.DefaultBankAccountID;
        let notUpdated = !taxError
            && employee.TaxCards
            && this.payrollRun
            && employee.TaxCards[0].Year < new Date(this.payrollRun.PayDate).getFullYear();

        if (taxError || accountError || notUpdated) {
            if (accountError && taxError) {
                error = 'Skatteinfo og kontonummer mangler';
            } else if (accountError) {
                error = 'Kontonummer mangler ';
            } else if (taxError) {
                error = 'Skatteinfo mangler ';
            }
            if (notUpdated) {
                error += 'Skattekort er ikke oppdatert';
            }
        }

        return error;
    }



    public rowSelected(event) {
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.getAga();
        this.setSums(null);
        this.setSummarySource();
        this.linkMenu$.next(this.generateLinkMenu(this.payrollRun, event.rowModel));
    }

    private getAga() {
        let employee = this.employeeList[this.selectedIndex];
        if (employee.SubEntity) {
            let obs = !this.agaZone || (employee.SubEntity.AgaZone !== this.agaZone.ID)
                ? this._agaZoneService
                    .Get(employee.SubEntity.AgaZone)
                    .catch((err, errObs) => this.errorService.handleRxCatch(err, errObs))
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
        let standardTaxPercent = taxCard && taxCard.Table ? '' : ' (50%)';

        this.summary = [{
            value: employeeTotals && this.numberFormat.asMoney(employeeTotals.percentTax),
            title: `Prosenttrekk` + (taxCard && taxCard.Percent
                ? ` (${taxCard.Percent}%)`
                : standardTaxPercent),
            description: employeeTotals
                && employeeTotals.basePercentTax
                ? `av ${this.numberFormat.asMoney(employeeTotals.basePercentTax)}` : null
        }, {
            value: employeeTotals && this.numberFormat.asMoney(employeeTotals.tableTax),
            title: 'Tabelltrekk' + (taxCard && taxCard.Table ? ` (${taxCard.Table})` : ''),
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

        let name = `${employee.BusinessRelationInfo ? employee.BusinessRelationInfo.Name : '...'}`;
        let error =
            `Gå til <a href="/#/salary/employees/${employee.ID}">${name}</a> for å legge inn `;
        let noBankAccounts = !employee.BusinessRelationID || !employee.BusinessRelationInfo.DefaultBankAccountID;
        let noTax = !taxCard || !taxCard.Table && !taxCard.Percent;

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
        let noTax = !taxCard || !taxCard.Table && !taxCard.Percent;
        let notUpdated = !noTax && this.payrollRun && taxCard.Year < new Date(this.payrollRun.PayDate).getFullYear();
        let ret: string = '';
        if (notUpdated) {
            ret += 'Skattekort er ikke oppdatert.';

            if (!this.hasError(employee)) {
                let name = `${employee.BusinessRelationInfo ? employee.BusinessRelationInfo.Name : '...'}`;
                ret += ` Gå til <a href="/#/salary/employees/${employee.ID}">
                        ${name}
                    </a> for å oppdatere skattekort.`;
            }
        }
        return ret;
    }

    public hasWarning(): boolean {
        let employee = this.employeeList[this.selectedIndex];
        let taxCard = this.getTaxcard(employee);
        let noTax = !taxCard || !taxCard.Table && !taxCard.Percent;
        return !noTax && this.payrollRun && taxCard.Year < new Date(this.payrollRun.PayDate).getFullYear();
    }

    public hasError(employee: Employee): boolean {
        let taxCard = employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
        let noBankAccounts = !employee.BusinessRelationID || !employee.BusinessRelationInfo.DefaultBankAccountID;
        let noTax = !taxCard || !taxCard.Table && !taxCard.Percent;

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

    private createNewDrawLink(employeeID: number) {
        return `#/salary/salarybalances/0/details;employeeID=${employeeID}`;
    }
    private createNewAdvanceLink(employeeID: number) {
        return `#/salary/salarybalances/0/details;employeeID=${employeeID};instalmentType=${SalBalType.Advance}`;
    }
    private createSalaryBalanceListLink(employeeID: number) {
        return `#/salary/salarybalances;empID=${employeeID}`;
    }
    private createSupplementsLink(payrollRunID: number) {
        return `#/salary/supplements;runID=${payrollRunID}`;
    }
    private createEmployeeLink(employeeID: number) {
        return `#/salary/employees/${employeeID}`;
    }
}
