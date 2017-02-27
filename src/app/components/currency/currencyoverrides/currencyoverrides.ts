import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {CurrencyCode} from '../../../unientities';
import {
    CurrencyOverride,
    LocalDate,
    CurrencySourceEnum
} from '../../../unientities';

import {
    CurrencyOverridesService,
    CurrencyCodeService,
    ErrorService
} from '../../../services/services';

declare const moment;
declare const _;

@Component({
    selector: 'currencyoverrides',
    templateUrl: './currencyoverrides.html'
})
export class CurrencyOverrides {
    @ViewChild(UniTable)
    private table: UniTable;

    private overridesTable: UniTableConfig;
    private saveActions: IUniSaveAction[] = [];
    private currencycodes: any;
    private overrides: any;
    private isBusy: boolean = true;

    private toolbarconfig: IToolbarConfig = {
        title: 'Valutaoverstyring',
        omitFinalCrumb: true
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private currencyOverridesService: CurrencyOverridesService,
        private tabService: TabService,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService
    ) {
        this.tabService.addTab({
            name: 'Valutaoverstyring',
            url: '/currency/overrides',
            moduleID: UniModules.Settings,
            active: true
        });

        this.currencyCodeService.GetAll('').subscribe(data => {
            this.currencycodes = data;
            this.setupOverridesTable();
            this.updateSaveActions();

            this.route.params.subscribe(params => {
                this.loadData(params);
            });
        });
    }

    private updateSaveActions() {
        this.saveActions = [];

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => this.save(done, null),
            disabled: false
        });
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.isBusy = true;
        return <Observable<T>>source.finally(() => this.isBusy = false);
    }

    private save(doneHandler: (status: string) => any, nextAction: () => any) {

        let tableData = this.table.getTableData();

        // set up observables (requests)
        let requests = tableData.filter(x => x._isDirty).map((currencyoverride: CurrencyOverride) => {
            return currencyoverride.ID > 0
                    ? this.currencyOverridesService.Put(currencyoverride.ID, currencyoverride)
                    : this.currencyOverridesService.Post(currencyoverride);
        });

        if (requests.length > 0) {
            Observable.forkJoin(requests)
                .subscribe(resp => {
                    if (!nextAction) {
                        doneHandler('Lagret endringer');
                        this.loadData();
                    } else {
                        nextAction();
                    }
                }, (err) => {
                    doneHandler('Feil ved lagring av data');
                    this.errorService.handle(err);
                });
        } else {
            if (!nextAction) {
                doneHandler('Ingen endringer funnet');
            } else {
                nextAction();
            }
        }
    }

    private isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    private loadData(routeparams = null) {
        if (this.isEmpty(routeparams)) {
            let params = new URLSearchParams();
            params.set('orderby', 'FromDate asc');
            params.set('expand', 'FromCurrencyCode,ToCurrencyCode');

            this.spinner(
                this.currencyOverridesService.GetAllByUrlSearchParams(params).map(response => response.json()))
                    .subscribe(data => {
                        this.overrides = data;
                    });
        } else {
            this.overrides = [
                {
                    ID: 0,
                    FromDate: new LocalDate(),
                    FromCurrencyCode: this.currencycodes.find(x => x.Code === routeparams['FromCurrencyCode']),
                    ToCurrencyCode: this.currencycodes.find(x => x.Code === 'NOK'),
                    Factor: routeparams['Factor'],
                    ExchangeRate: routeparams['ExchangeRate'],
                    Source: CurrencySourceEnum.NORGESBANK
                }
            ];
            this.isBusy = false;
            this.table.refreshTableData();
        }
    }

    private setupOverridesTable() {
        // Define columns to use in the table
        let fromDateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let updatedAtCol = new UniTableColumn('UpdatedAt', 'Sist oppdatert', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq')
            .setEditable(false)
            .setTemplate((row: CurrencyOverride) => {
                return row.ID ? new LocalDate(!!row.UpdatedAt ? row.UpdatedAt : row.CreatedAt).toString() : '';
            });
        let exchangeRateCol = new UniTableColumn('ExchangeRate', 'Kurs', UniTableColumnType.Money)
            .setWidth('100px').setFilterOperator('contains');
        let factorCol = new UniTableColumn('Factor', 'Omregningsenhet', UniTableColumnType.Money)
            .setWidth('100px').setFilterOperator('contains');
        let fromCurrencyCodeCol = new UniTableColumn('FromCurrencyCode', 'Fra kode', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Code')
            .setWidth('60px')
            .setEditorOptions({
                itemTemplate: (currencycode: CurrencyCode) => {
                    return `${currencycode.Code} - ${currencycode.Name}`;
                },
                lookupFunction: (query: string) => {
                    return this.currencycodes;
                }
            });
        let toCurrencyCodeCol = new UniTableColumn('ToCurrencyCode', 'Til kode', UniTableColumnType.Lookup)
            .setDisplayField('ToCurrencyCode.Code')
            .setWidth('60px')
            .setEditorOptions({
                itemTemplate: (currencycode: CurrencyCode) => {
                    return `${currencycode.Code} - ${currencycode.Name}`;
                },
                lookupFunction: (query: string) => {
                    return this.currencycodes;
                }
            });
        let fromCurrencyShortCodeCol = new UniTableColumn('FromCurrencyCode.ShortCode', '$', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.ShortCode')
            .setWidth('30px')
            .setEditable(false);

        let fromCurrencyNameCol = new UniTableColumn('FromCurrencyCode.Name', 'Valuta', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Name')
            .setEditable(false)
            .setWidth('10%');

        // Setup table
        this.overridesTable = new UniTableConfig(true, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(true)
            .setDeleteButton({
                deleteHandler: (row) => {
                    if (isNaN(row.ID)) { return true; }
                    return this.currencyOverridesService.Remove(row.ID, 'CurrencyOverride');
                }
            })
            .setDefaultRowData({
                ID: 0,
                FromDate: new LocalDate(),
                ToCurrencyCode: this.currencycodes.find(x => x.Code === 'NOK'),
                Factor: 1,
                Source: CurrencySourceEnum.NORGESBANK
            })
            .setChangeCallback((row) => {
                let item = row.rowModel;
                item._isDirty = true;

                if (item.FromCurrencyCode) { item.FromCurrencyCodeID = item.FromCurrencyCode.ID; }
                if (item.ToCurrencyCode) { item.ToCurrencyCodeID = item.ToCurrencyCode.ID; }

                return item;
            })
            .setColumns([updatedAtCol, fromDateCol, toDateCol, fromCurrencyCodeCol, fromCurrencyNameCol,
                         fromCurrencyShortCodeCol, toCurrencyCodeCol,
                         factorCol, exchangeRateCol]);
    }
}
