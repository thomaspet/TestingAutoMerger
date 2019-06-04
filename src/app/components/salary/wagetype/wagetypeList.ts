import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';

import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {WageTypeService, ErrorService, StatisticsService} from '../../../services/services';

import {WageType} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'wagetypes',
    templateUrl: './wagetypeList.html'
})
export class WagetypeList {
    public contextMenuItems: IContextMenuItem[] = [];
    public busy: boolean;
    wagetypeTableConfig: UniTableConfig;
    lookupFunction: (urlParams: URLSearchParams) => any;

    public toolbarActions = [
        {
            label: 'Ny lønnsart',
            action: this.createWageType.bind(this),
            main: true,
            disabled: false
        }
    ];

    constructor(
        private _router: Router,
        private tabSer: TabService,
        private _wageTypeService: WageTypeService,
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private _toastService: ToastService
    ) {
        this._wageTypeService.invalidateCache();

        this.tabSer.addTab({
            name: 'Lønnsarter',
            url: 'salary/wagetypes',
            moduleID: UniModules.Wagetypes,
            active: true
        });

        this.contextMenuItems = [
            {
                label: 'Synkroniser lønnsarter',
                action: () => {
                    this.syncWagetypes();
                },
                disabled: () => false
            }
        ];
        this.createTableConfig();
    }

    public onCustomClick() {
        this.syncWagetypes();
    }

    public createTableConfig() {
        this.setLookupFunction();

        const idCol = new UniTableColumn('WageTypeNumber', 'Nr', UniTableColumnType.Number)
            .setWidth('3rem')
            .setAlignment('center');

        const nameCol = new UniTableColumn('WageTypeName', 'Navn', UniTableColumnType.Text);

        const accountNumberCol = new UniTableColumn('AccountNumber', 'Hovedbokskonto', UniTableColumnType.Text)
            .setWidth('10rem')
            .setAlignment('right');

        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);

        const basePaymentCol = new UniTableColumn('Base_Payment', 'Utbetales')
            .setTemplate(wageType => (wageType.Base_Payment ? 'Ja' : 'Nei'));

        const yearCol = new UniTableColumn('ValidYear', 'År', UniTableColumnType.Number);

        this.wagetypeTableConfig = new UniTableConfig('salary.wagetype.list', false)
            .setColumns([
                idCol,
                nameCol,
                accountNumberCol,
                rateCol,
                basePaymentCol,
                yearCol,
            ])
            .setSearchable(true);
    }

    public wagetypeSelected(wagetype: WageType) {
        this._router.navigate(['/salary/wagetypes/', wagetype.ID]);
    }

    public createWageType() {
        this._router.navigateByUrl('/salary/wagetypes/0');
    }

    setLookupFunction = () => {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            const params = urlParams || new URLSearchParams();

            // Use split to get filter value and the custom create filter string with Number and Name fields
            const filterValue = urlParams.get('filter');
            const filterSplit = filterValue
                ? filterValue.split(`'`)
                : filterValue;
            let filterString = '';
            if (filterSplit && filterSplit.length) {
                filterString = `contains(WageTypeNumber,'${
                    filterSplit[1]
                }') or contains(WageTypeName,'${filterSplit[1]}')`;
            }

            params.set('model', 'WageType');
            params.set(
                'select',
                'ID as ID,WageTypeNumber as WageTypeNumber,WageTypeName as WageTypeName,AccountNumber as AccountNumber' +
                    ',Rate as Rate,Base_Payment as Base_Payment,ValidYear as ValidYear'
            );
            params.set('filter', filterString);
            params.set('orderby', 'WageTypeNumber ASC,ValidYear DESC');

            return this.statisticsService
                .GetAllByUrlSearchParams(params).do(() => this.busy = false)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };
    }

    public syncWagetypes() {
        this.busy = true;
        this._wageTypeService.invalidateCache();
        this._wageTypeService
            .syncWagetypes()
            .do(() => this.setLookupFunction())
            .finally(() => (this.busy = false))
            .subscribe(
                response => {
                    this._toastService.addToast(
                        'Lønnsarter synkronisert',
                        ToastType.good,
                        4
                    );
                },
                err => this.errorService.handle(err)
            );
    }
}
