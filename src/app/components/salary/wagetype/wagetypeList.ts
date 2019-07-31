import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {WageTypeService, ErrorService, StatisticsService} from '../../../services/services';

import {CompanySalary} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
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
        private statisticsService: StatisticsService
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
        return this._wageTypeService.GetAllByUrlSearchParams(params);
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
