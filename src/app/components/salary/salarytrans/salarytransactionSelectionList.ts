import {Component, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {
    UniTableConfig,
    UniTableColumnType,
    UniTableColumn
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniHttp} from '@uni-framework/core/http/http';
import {
    Employee, AGAZone, SalaryTransactionSums,
    PayrollRun, EmployeeTaxCard, SalBalType, ValidationLevel, TaxCard
} from '../../../unientities';
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
    SalarySumsService,
    EmployeeTaxCardService
} from '../../../services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';

declare var _;
const PAYROLL_RUN_KEY = 'payrollRun';

@Component({
    selector: 'salarytrans',
    templateUrl: './salarytransactionSelectionList.html'
})

export class SalaryTransactionSelectionList extends UniView implements AfterViewInit {
    public salarytransSelectionTableConfig: UniTableConfig;
    public employeeList: Employee[] = [];
    public selectedIndex: number = 0;
    public agaZone: AGAZone;
    public summary: ISummaryConfig[] = [];
    public linkMenu$: ReplaySubject<ILinkMenuItem[]>;
    private payrollRunID: number;
    private payrollRun: PayrollRun;

    @Output() public changedPayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    public busy: boolean;
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;
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
        private errorService: ErrorService,
        private toastService: ToastService,
        private taxCardService: EmployeeTaxCardService
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

            super.getStateSubject(PAYROLL_RUN_KEY)
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
                {label: 'Forskudd', link: this.createNewAdvanceLink(employee.ID)},
                {label: 'Trekk', link: this.createNewDrawLink(employee.ID)},
                {label: 'Saldooversikt', link: this.createSalaryBalanceListLink(employee.ID)}
            ];
            const error = this.generateEmployeeError(employee);
            if (error) {
                items.unshift(
                    {label: error, link: this.createEmployeeLink(employee.ID), validation: ValidationLevel.Error}
                );
            }
        }

        if (payrollRun) {
            if (payrollRun.StatusCode > 0) {
                items.push({label: 'Tilleggsopplysninger', link: this.createSupplementsLink(payrollRun.ID)});
            }
        }

        return items;
    }

    public focusRow(index?) {
        if (this.table) {
            this.table.focusRow(index === undefined ? this.selectedIndex : index);
        }
    }

    public tableConfig() {
        const employeenumberCol = new UniTableColumn('EmployeeNumber', '#')
            .setWidth('3rem');
        const nameCol = new UniTableColumn('BusinessRelationInfo.Name', 'Navn')
            .setTooltipResolver(rowModel => {
                const error = this.generateEmployeeError(rowModel);
                if (error) {
                    return {
                        type: 'bad',
                        text: error,
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
        const taxError = !employee.TaxCards ||
            !this.taxCardService
                .hasTaxCard(employee.TaxCards[0], this.payrollRun && new Date(this.payrollRun.PayDate).getFullYear());

        const accountError = !employee.BusinessRelationID
            || !employee.BusinessRelationInfo.DefaultBankAccountID;

        const errors: string[] = [];
        if (taxError) {
            errors.push('Skatteinfo');
        }
        if (accountError) {
            errors.push((errors.length ? 'k' : 'K') + 'ontonummer');
        }
        const lastEntry = errors.pop() || '';
        if (!lastEntry) {
            return '';
        }

        return (errors.length ? errors.join(', ') + ' og ' + lastEntry : lastEntry) + ' mangler';
    }



    public rowSelected(row) {
        this.selectedIndex = row['_originalIndex'];
        this.getAga();
        this.setSums(null);
        this.setSummarySource();
        this.linkMenu$.next(this.generateLinkMenu(this.payrollRun, row));
    }

    private getAga() {
        const employee = this.employeeList[this.selectedIndex];
        if (employee.SubEntity && employee.SubEntity.AgaZone > 0) {
            const obs = !this.agaZone || (employee.SubEntity.AgaZone !== this.agaZone.ID)
                ? this._agaZoneService
                    .Get(employee.SubEntity.AgaZone)
                    .catch((err, errObs) => this.errorService.handleRxCatch(err, errObs))
                : Observable.of(this.agaZone);

            obs.subscribe((agaResponse: AGAZone) => {
                this.agaZone = agaResponse;
            });
        } else {
            if (!employee.SubEntity || employee.SubEntity.AgaZone === 0) {
                this.toastService.addToast('Arbeidsgiveravgift', ToastType.warn, ToastTime.medium,
                'Kunne ikke finne sone for arbeidsgiveravgift på den ansatte, sjekk innstillingene');
            }
            this.agaZone = new AGAZone();
        }
    }

    private setSums(employeeTotals: SalaryTransactionSums) {
        const employee = this.employeeList[this.selectedIndex];
        const taxCard = employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
        super.getStateSubject(PAYROLL_RUN_KEY)
            .take(1)
            .map((run: PayrollRun) => this.taxCardService.getTaxCardPercentAndTable(taxCard, new Date(run.PayDate).getFullYear()))
            .subscribe(taxCardInfo => {
                this.summary = [{
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.percentTax),
                    title: `Prosenttrekk ` + taxCardInfo.percent,
                    description: employeeTotals
                        && employeeTotals.basePercentTax
                        ? `av ${this.numberFormat.asMoney(employeeTotals.basePercentTax)}` : null
                }, {
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.tableTax),
                    title: 'Tabelltrekk ' + taxCardInfo.table,
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
            });
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
        const index = _.findIndex(this.employeeList, x => x.ID === this.employeeList[this.selectedIndex].ID);
        if (index + 1 < this.employeeList.length) {
            this.selectedIndex = index + 1;
            this.focusRow(this.selectedIndex);
        }
    }

    public goToPreviousEmployee() {
        const index = _.findIndex(this.employeeList, x => x.ID === this.employeeList[this.selectedIndex].ID);
        if (index > 0) {
            this.selectedIndex = index - 1;
            this.focusRow(this.selectedIndex);
        }
    }

    public hasDirty(): boolean {
        return this.transList ? this.transList.hasDirty() : false;
    }

    public updateSums() {
        this.setSummarySource();
    }

    public setEditable(isEditable: boolean) {
        if (this.transList) {
            this.transList.setEditable(isEditable);
        }
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
