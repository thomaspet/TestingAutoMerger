import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {WageTypeService, ErrorService, StatisticsService, FinancialYearService, CompanySalaryService} from '../../../services/services';
import {Observable, of} from 'rxjs';

import {WageType, CompanySalary} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {finalize, map, switchMap, tap} from 'rxjs/operators';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'wagetypes',
    templateUrl: './wagetypeList.html'
})
export class WagetypeList implements OnInit {

    public tableConfig: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;
    public contextMenuItems: IContextMenuItem[] = [];
    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    public busy: boolean;

    public toolbarActions = [{
        label: 'Ny lønnsart',
        action: this.createWageType.bind(this),
        main: true,
        disabled: false
    }];

    private companySalary: CompanySalary;

    constructor(
        private _router: Router,
        private tabSer: TabService,
        private _wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private _toastService: ToastService,
        private statisticsService: StatisticsService,
        private yearService: FinancialYearService,
        private companySalaryService: CompanySalaryService,
    ) {
        this.tabSer.addTab(
            { name: 'Lønnsarter', url: 'salary/wagetypes', moduleID: UniModules.Wagetypes, active: true }
        );

        this.contextMenuItems = [
            {
                label: 'Synkroniser lønnsarter',
                action: () => {
                    this.syncWagetypes();
                },
                disabled: () => false
            }
        ];
    }

    public onCustomClick() {
        this.syncWagetypes();
    }

    public ngOnInit() {
        this._wageTypeService.invalidateCache();
        this.lookupFunction = (urlParams) => this.lookup(urlParams);

        const idCol = new UniTableColumn('WageTypeNumber', 'Nr', UniTableColumnType.Text)
            .setWidth('3rem')
            .setAlignment('center')
            .setFilterOperator('startswith');

        const nameCol = new UniTableColumn('WageTypeName', 'Navn', UniTableColumnType.Text);
        const accountNumberCol = new UniTableColumn('AccountNumber', 'Hovedbokskonto', UniTableColumnType.Text)
            .setWidth('10rem')
            .setAlignment('right');

        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);

        const basePaymentCol = new UniTableColumn('Base_Payment', 'Utbetales', UniTableColumnType.Boolean);

        let pageSize = window.innerHeight - 350;
        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.tableConfig = new UniTableConfig('salary.wagetype.list', false, true, pageSize)
            .setColumns([idCol, nameCol, accountNumberCol, rateCol, basePaymentCol])
            .setSearchable(true);
    }

    public lookup(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        return this.getCompanySalary()
            .pipe(
                switchMap(companySalary => {
                    const filter = params.get('filter');
                    if (filter) {
                        params
                            .set('filter', `${filter} and ${this._wageTypeService.specialTaxAndContributionRuleFilter(companySalary)}`);
                    } else {
                        params
                            .set('filter', `${this._wageTypeService.specialTaxAndContributionRuleFilter(companySalary)}`);
                    }
                    return this.getWts(params);
                }),
            );
    }

    private getWts(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();

        params.set('model', 'WageType');
        const fields = [
            'ID as ID',
            'WageTypeNumber as WageTypeNumber',
            'WageTypeName as WageTypeName',
            'Rate as Rate',
            'Base_Payment as Base_Payment',
            'AccountNumber as AccountNumber',
            'ValidYear as ValidYear',
        ];

        params.set('select', 'WageTypeNumber as WageTypeNumber,max(ValidYear) as ValidYear');
        params.set('orderby', params.get('orderby') || 'WageTypeNumber');
        const filter = params.get('filter');
        if (filter) {
            params.set('filter', `${filter} and (ValidYear le ${this.yearService.getActiveYear()})`);
        } else {
            params.set('filter', `ValidYear le ${this.yearService.getActiveYear()}`);
        }

        let totalRecords = 0;
        return this.statisticsService
            .GetAllByUrlSearchParams(params)
            .pipe(
                switchMap(result => {
                    const data = result.json().Data;
                    if (!data.length) {
                        return of(result);
                    }

                    // so we need newest distinct wagetypes from statistics
                    // the best i can do at this point is to ask for latest year on each wt numbers,
                    // and then ask for more fields on those...
                    params.set('select', fields.join(','));
                    params.set('filter', this.specificWtsQuery(data));
                    params.set('top', `${0}`);
                    params.set('skip', `${0}`);
                    totalRecords = +result.headers.get('count');
                    return this.statisticsService.GetAllByUrlSearchParams(params);
                }),
                map(result => {
                    result.headers.set('count', `${totalRecords}`);
                    return result;
                }),
                finalize(() => this.busy = false),
            )
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getCompanySalary() {
        if (this.companySalary) {
            return of(this.companySalary);
        }
        this.busy = true;
        return this.companySalaryService
            .getCompanySalary()
            .pipe(
                tap(compSal => this.companySalary = compSal),
            );
    }

    private specificWtsQuery(wts: {WageTypeNumber: number, ValidYear: number}[]): string {
        return wts.map(x => `(ValidYear eq ${x.ValidYear} and WageTypeNumber eq ${x.WageTypeNumber})`).join(' or ');
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/wagetypes/' + event.ID);
    }

    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }

    public syncWagetypes() {
        this._wageTypeService.invalidateCache();
        this.statisticsService.invalidateCache();
        this.busy = true;
        this._wageTypeService
            .syncWagetypes()
            .do(() => this.table.refreshTableData())
            .subscribe((response) => {
                this._toastService.addToast('Lønnsarter synkronisert', ToastType.good, 4);
            }
        , err => this.errorService.handle(err));
    }
}
