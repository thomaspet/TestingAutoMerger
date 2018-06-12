import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {
    UniTable,
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    INumberFormat
} from '../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {CurrencyCode} from '../../../unientities';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {CurrencyOverride, LocalDate, CurrencySourceEnum} from '../../../unientities';
import {
    NumberFormat,
    CurrencyOverridesService,
    CurrencyCodeService,
    ErrorService
} from '../../../services/services';

import * as moment from 'moment';
declare const _;

@Component({
    selector: 'currencyoverrides',
    templateUrl: './currencyoverrides.html'
})
export class CurrencyOverrides {
    @ViewChild(UniTable)
    private table: UniTable;

    public overridesTable: UniTableConfig;
    public saveActions: IUniSaveAction[] = [];
    private currencycodes: any;
    public overrides: any;
    public isBusy: boolean = true;
    private isDirty: boolean = false;

    public toolbarconfig: IToolbarConfig = {
        title: 'Valutaoverstyring',
        omitFinalCrumb: true
    };

    private exchangerateFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 4,
        postfix: undefined
    };

    private factorFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 0,
        postfix: undefined
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private currencyOverridesService: CurrencyOverridesService,
        private tabService: TabService,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
        private numberFormat: NumberFormat,
        private modalService: UniModalService
    ) {
        this.addTab();
        this.currencyCodeService.GetAll('').subscribe(data => {
            this.currencycodes = data;
            this.setupOverridesTable();
            this.updateSaveActions();

            this.route.params.subscribe(params => {
                this.loadData(params);
            });
        });
    }

    private addTab() {
        this.tabService.addTab({
            name: 'Valutaoverstyring',
            url: '/currency/overrides',
            moduleID: UniModules.Settings,
            active: true
        });
    }

    public canDeactivate(): boolean | Observable<boolean> {
        return !this.isDirty
            ? Observable.of(true)
            : this.modalService
                .openUnsavedChangesModal()
                .onClose
                .switchMap((result) => {
                    if (result === ConfirmActions.ACCEPT) {
                        return this.save();
                    }

                    return Observable.of(result !== ConfirmActions.CANCEL);
                });
    }

    public rowChanged(event) {
        this.isDirty = true;
    }

    private updateSaveActions() {
        this.saveActions = [];

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                if (!this.table.getTableData().find(x => x._isDirty)) {
                    done('Ingen endringer');
                } else {
                    this.save().subscribe(savedOk => {
                        if (savedOk) { this.loadData(); }
                        done(savedOk ? 'Lagret endringer' : 'Lagring feilet');
                    });
                }
            },
            disabled: false
        });
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.isBusy = true;
        return <Observable<T>>source.finally(() => this.isBusy = false);
    }

    private save(): Observable<boolean> {
        let tableData = this.table.getTableData();

        // set up observables (requests)
        let requests = tableData.filter(x => x._isDirty).map((currencyoverride: CurrencyOverride) => {
            return currencyoverride.ID > 0
                    ? this.currencyOverridesService.Put(currencyoverride.ID, currencyoverride)
                    : this.currencyOverridesService.Post(currencyoverride);
        });

        return requests.length === 0
            ? Observable.of(true)
            : Observable
                .forkJoin(requests)
                .map(() => {
                    this.isDirty = false;
                    return true;
                }).catch(err => {
                    this.errorService.handle(err);
                    return Observable.of(false);
                });
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
            let params = new URLSearchParams();
            params.set('orderby', 'FromDate asc');
            params.set('expand', 'FromCurrencyCode,ToCurrencyCode');

            this.spinner(
                this.currencyOverridesService.GetAllByUrlSearchParams(params).map(response => response.json()))
                    .subscribe(data => {
                        if (!this.isEmpty(routeparams)) {
                            data.unshift({
                                ID: 0,
                                FromDate: new LocalDate(),
                                FromCurrencyCode: this.currencycodes.find(
                                    x => x.Code === routeparams['FromCurrencyCode']
                                ),
                                ToCurrencyCode: this.currencycodes.find(x => x.Code === 'NOK'),
                                Factor: routeparams['Factor'],
                                ExchangeRate: routeparams['ExchangeRate'],
                                Source: CurrencySourceEnum.NORGESBANK
                            });
                        }

                        this.overrides = data;
                    });
    }

    private setupOverridesTable() {
        // Define columns to use in the table
        let fromDateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let updatedAtCol = new UniTableColumn('UpdatedAt', 'Sist oppdatert', UniTableColumnType.Text)
            .setWidth('8%').setFilterOperator('eq')
            .setEditable(false)
            .setTemplate((row: CurrencyOverride) => {
                return row.ID
                    ? moment(new LocalDate(!!row.UpdatedAt ? row.UpdatedAt : row.CreatedAt)).format('DD.MM.YYYY')
                    : 'ny';
            });
        let exchangeRateCol = new UniTableColumn('ExchangeRate', 'Kurs', UniTableColumnType.Money)
            .setWidth('100px').setFilterOperator('contains')
            .setNumberFormat(this.exchangerateFormat);
        let factorCol = new UniTableColumn('Factor', 'Omregningsenhet', UniTableColumnType.Money)
            .setWidth('100px').setFilterOperator('contains')
            .setNumberFormat(this.factorFormat);
        let fromCurrencyCodeCol = new UniTableColumn('FromCurrencyCode', 'Fra kode', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Code')
            .setWidth('60px')
            .setOptions({
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
            .setOptions({
                itemTemplate: (currencycode: CurrencyCode) => {
                    return `${currencycode.Code} - ${currencycode.Name}`;
                },
                lookupFunction: (query: string) => {
                    return this.currencycodes;
                }
            });
        let fromCurrencyShortCodeCol = new UniTableColumn(
            'FromCurrencyCode.ShortCode', '$', UniTableColumnType.Lookup
        )
            .setDisplayField('FromCurrencyCode.ShortCode')
            .setWidth('30px')
            .setEditable(false);

        let fromCurrencyNameCol = new UniTableColumn('FromCurrencyCode.Name', 'Valuta', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Name')
            .setEditable(false)
            .setWidth('10%');

        // Setup table
        this.overridesTable = new UniTableConfig('currency.currencyoverrides', true, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(true)
            .setDeleteButton({
                deleteHandler: (row) => {
                    if (isNaN(row.ID) || row.ID === 0) { return true; }
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
