import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, INumberFormat} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {CurrencyCode} from '../../../unientities';
import {UniConfirmModal, ConfirmActions} from '../../../../framework/modals/confirm';
import {
    CurrencyOverride,
    LocalDate,
    CurrencySourceEnum
} from '../../../unientities';

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
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private overridesTable: UniTableConfig;
    private saveActions: IUniSaveAction[] = [];
    private currencycodes: any;
    private overrides: any;
    private isBusy: boolean = true;
    private isDirty: boolean = false;

    private toolbarconfig: IToolbarConfig = {
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
        private numberFormat: NumberFormat
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

    public canDeactivate(): boolean|Promise<boolean> {
        if (!this.isDirty) {
            return true;
        }

        return new Promise<boolean>((resolve, reject) => {
             this.confirmModal.confirm(
                 'Du har endringer som ikke er lagret - disse vil forkastes hvis du fortsetter?',
                 'Vennligst bekreft',
                 false,
                 {accept: 'Fortsett uten å lagre', reject: 'Avbryt'}
             ).then((confirmDialogResponse) => {
                if (confirmDialogResponse === ConfirmActions.ACCEPT) {
                     resolve(true);
                } else {
                     resolve(false);
                 }
             });
         });
    }

    private rowChanged(event) {
        this.isDirty = true;
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
                    this.isDirty = false;
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
                                FromCurrencyCode: this.currencycodes.find(x => x.Code === routeparams['FromCurrencyCode']),
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
                return row.ID ? moment(new LocalDate(!!row.UpdatedAt ? row.UpdatedAt : row.CreatedAt)).format('DD.MM.YYYY') : 'ny';
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
