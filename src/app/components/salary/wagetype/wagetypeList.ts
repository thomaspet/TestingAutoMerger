import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {WageTypeService, ErrorService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';

import {WageType} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import { IContextMenuItem } from 'unitable-ng2/main';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'wagetypes',
    templateUrl: './wagetypeList.html',
})
export class WagetypeList implements OnInit {

    private tableConfig: UniTableConfig;
    private wageTypes$: Observable<WageType>;
    private contextMenuItems: IContextMenuItem[] = [];

    constructor(
        private _router: Router,
        private tabSer: TabService,
        private _wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private _toastService: ToastService
    ) {
        this.tabSer.addTab({ name: 'Lønnsarter', url: 'salary/wagetypes', moduleID: UniModules.Wagetypes, active: true });

        this.contextMenuItems = [
            {
                label: 'Synkroniser lønnsarter',
                action: () => {
                    this.syncWagetypes();
                }
            }
        ];
    }

    public ngOnInit() {

        this.wageTypes$ = this._wageTypeService.GetAll('orderBy=WageTypeNumber ASC')
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));

        const idCol = new UniTableColumn('WageTypeNumber', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('5rem');

        const nameCol = new UniTableColumn('WageTypeName', 'Navn', UniTableColumnType.Text);
        const accountNumberCol = new UniTableColumn('AccountNumber', 'Hovedbokskonto', UniTableColumnType.Text).setWidth('10rem').setAlignment('right');

        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);

        const basePaymentCol = new UniTableColumn('Base_Payment', 'Utbetales').setTemplate((wageType: WageType) => {
            return wageType.Base_Payment ? 'Ja' : 'Nei';
        });

        this.tableConfig = new UniTableConfig(false, true, 15)
            .setColumns([idCol, nameCol, accountNumberCol, rateCol, basePaymentCol])
            .setSearchable(true);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/wagetypes/' + event.rowModel.ID);
    }

    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }

    public syncWagetypes() {
        this._wageTypeService.syncWagetypes()
            .subscribe((response) => {
                this._toastService.addToast('Lønnsarter synkronisert', ToastType.good, 4);
            });
    }
}
