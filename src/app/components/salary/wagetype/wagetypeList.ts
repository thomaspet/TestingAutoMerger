import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {WageTypeService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs';

import {WageType} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'wagetypes',
    templateUrl: './wagetypeList.html'
})
export class WagetypeList implements OnInit {

    public tableConfig: UniTableConfig;
    public wageTypes$: Observable<WageType>;
    public contextMenuItems: IContextMenuItem[] = [];
    public busy: boolean;

    public toolbarActions = [{
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
        private _toastService: ToastService
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
        this.busy = true;
        this.getWagetypes();

        const idCol = new UniTableColumn('WageTypeNumber', 'Nr', UniTableColumnType.Number)
            .setWidth('3rem')
            .setAlignment('center');

        const nameCol = new UniTableColumn('WageTypeName', 'Navn', UniTableColumnType.Text);
        const accountNumberCol = new UniTableColumn('AccountNumber', 'Hovedbokskonto', UniTableColumnType.Text)
            .setWidth('10rem')
            .setAlignment('right');

        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);

        const basePaymentCol = new UniTableColumn('Base_Payment', 'Utbetales')
            .setTemplate(wageType =>  wageType.Base_Payment ? 'Ja' : 'Nei'
            );

        let pageSize = window.innerHeight - 350;
        pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

        this.tableConfig = new UniTableConfig('salary.wagetype.list', false, true, pageSize)
            .setColumns([idCol, nameCol, accountNumberCol, rateCol, basePaymentCol])
            .setSearchable(true);
    }

    private getWagetypes() {
        this.wageTypes$ = this._wageTypeService
            .GetAll('orderBy=WageTypeNumber ASC')
            .finally(() => { this.busy = false; })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/wagetypes/' + event.ID);
    }

    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }

    public syncWagetypes() {
        this.busy = true;
        this._wageTypeService.invalidateCache();
        this._wageTypeService.syncWagetypes()
            .do(() => this.getWagetypes())
            .finally(() => this.busy = false)
            .subscribe((response) => {
                this._toastService.addToast('Lønnsarter synkronisert', ToastType.good, 4);
            }
        , err => this.errorService.handle(err));
    }
}
