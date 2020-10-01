import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn, IContextMenuItem} from '@uni-framework/ui/unitable';
import {WageTypeService, ErrorService, StatisticsService} from '@app/services/services';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {HttpParams} from '@angular/common/http';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { finalize, tap } from 'rxjs/operators';

@Component({
    selector: 'wagetypes',
    templateUrl: './wage-type-list.component.html'
})
export class WageTypeListComponent implements OnInit {

    tableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;
    contextMenuItems: IContextMenuItem[] = [];
    @ViewChild(AgGridWrapper, { static: true }) table: AgGridWrapper;
    busy: boolean;
    showEmptyState: boolean;

    toolbarActions = [{
        label: 'Ny lønnsart',
        action: this.createWageType.bind(this),
        main: true,
        disabled: false
    }];

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
        this.busy = true;
        this._wageTypeService
            .needSync()
            .pipe(
                finalize(() => this.busy = false),
            )
            .subscribe(needSync => this.showEmptyState = needSync);
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

    public lookup(urlParams: HttpParams) {
        const params = urlParams || new HttpParams();
        return this._wageTypeService
            .GetAllByHttpParams(params);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/wagetypes/' + event.ID);
    }

    public createWageType(done) {
        this._router.navigateByUrl('/salary/wagetypes/0').then(succeeded => {
            if (succeeded) {
                return;
            }
            done('Avbrutt');
        });
    }

    public syncWagetypes() {
        this._wageTypeService.invalidateCache();
        this.statisticsService.invalidateCache();
        this.busy = true;
        this._wageTypeService
            .syncWagetypes()
            .pipe(
                tap(() => this.table.refreshTableData()),
                finalize(() =>  this.busy = false),
            )
            .subscribe((response) => {
                this.showEmptyState = false;
                this._toastService.addToast('Lønnsarter synkronisert', ToastType.good, 4);
            }
        , err => this.errorService.handle(err));
    }
}
