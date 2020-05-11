import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpParams} from '@angular/common/http';
import {Observable, forkJoin, of as observableOf} from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import * as moment from 'moment';

import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IUniSaveAction} from '@uni-framework/save/save';
import {CurrencyCode, CurrencyOverride, LocalDate, CurrencySourceEnum} from '@uni-entities';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {CurrencyOverridesService, CurrencyCodeService, ErrorService} from '@app/services/services';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    INumberFormat
} from '@uni-framework/ui/unitable';

@Component({
    selector: 'currencyoverrides',
    templateUrl: './currencyoverrides.html'
})
export class CurrencyOverrides {
    public overridesTable: UniTableConfig;
    public saveActions: IUniSaveAction[] = [];
    private currencycodes: CurrencyCode[];
    public overrides: any;
    public isBusy: boolean = true;
    private isDirty: boolean = false;

    public toolbarconfig: IToolbarConfig = {
        title: 'Valutaoverstyring',
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
        private currencyOverridesService: CurrencyOverridesService,
        private tabService: TabService,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
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
            moduleID: UniModules.SubSettings,
            active: true
        });
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (this.isDirty) {
            return this.modalService.openUnsavedChangesModal().onClose.switchMap(result => {
                if (result === ConfirmActions.ACCEPT) {
                    return this.save();
                }

                return Observable.of(result !== ConfirmActions.CANCEL);
            });
        }

        return true;
    }

    public onRowDeleted(row) {
        if (row.ID) {
            this.currencyOverridesService.Remove(row.ID).subscribe(
                () => {},
                err => this.errorService.handle(err)
            );
        }
    }

    private updateSaveActions() {
        this.saveActions = [];

        this.saveActions.push({
            label: 'Lagre',
            action: (done) => {
                if (this.isDirty) {
                    this.save().subscribe(success => {
                        done(success ? 'Endringer lagret' : 'Lagring feilet');
                        if (success) {
                            this.loadData();
                        }
                    });
                } else {
                    done('Ingen endringer');
                }
            },
            disabled: false
        });
    }

    private save(): Observable<boolean> {
        const changedRows = this.overrides.filter(row => row['_isDirty']);
        if (changedRows.length) {
            const requests = changedRows.map((currencyoverride: CurrencyOverride) => {
                return currencyoverride.ID > 0
                    ? this.currencyOverridesService.Put(currencyoverride.ID, currencyoverride)
                    : this.currencyOverridesService.Post(currencyoverride);
            });

            return forkJoin(requests).pipe(
                map(() => {
                    this.isDirty = false;
                    return true;
                }),
                catchError(err => {
                    this.errorService.handle(err);
                    return observableOf(false);
                })
            );
        } else {
            return observableOf(true);
        }
    }

    private loadData(routeparams = null) {
        const params = new HttpParams()
            .set('orderby', 'FromDate asc')
            .set('expand', 'FromCurrencyCode,ToCurrencyCode');

        this.currencyOverridesService.GetAllByHttpParams(params).subscribe(
            res => {
                const data = res.body;
                const hasParams = Object.keys(routeparams).some(key => routeparams.hasOwnProperty(key));
                if (hasParams) {
                    data.push({
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
            },
            err => this.errorService.handle(err)
        );
    }

    currencyCodeLookup(query: string): CurrencyCode[] {
        return (this.currencycodes || []).filter(currencyCode => {
            const code = (currencyCode.Code || '').toLowerCase();
            const name = (currencyCode.Name || '').toLowerCase();
            const queryLowerCase = query.toLowerCase();

            return code.includes(queryLowerCase) || name.includes(queryLowerCase);
        });
    }

    private setupOverridesTable() {
        const fromDateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        const toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);
        const updatedAtCol = new UniTableColumn('UpdatedAt', 'Sist oppdatert', UniTableColumnType.Text)
            .setEditable(false)
            .setTemplate((row: CurrencyOverride) => {
                return row.ID
                    ? moment(new LocalDate(!!row.UpdatedAt ? row.UpdatedAt : row.CreatedAt)).format('DD.MM.YYYY')
                    : 'ny';
            });
        const exchangeRateCol = new UniTableColumn('ExchangeRate', 'Kurs', UniTableColumnType.Money)
            .setNumberFormat(this.exchangerateFormat);
        const factorCol = new UniTableColumn('Factor', 'Omregningsenhet', UniTableColumnType.Money)
            .setNumberFormat(this.factorFormat);
        const fromCurrencyCodeCol = new UniTableColumn('FromCurrencyCode', 'Fra kode', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Code')
            .setOptions({
                itemTemplate: (currencycode) => `${currencycode.Code} - ${currencycode.Name}`,
                lookupFunction: (query: string) => this.currencyCodeLookup(query)
            });
        const toCurrencyCodeCol = new UniTableColumn('ToCurrencyCode', 'Til kode', UniTableColumnType.Lookup)
            .setDisplayField('ToCurrencyCode.Code')
            .setOptions({
                itemTemplate: (currencycode) => `${currencycode.Code} - ${currencycode.Name}`,
                lookupFunction: (query: string) => this.currencyCodeLookup(query)
            });
        const fromCurrencyShortCodeCol = new UniTableColumn('FromCurrencyCode.ShortCode', '$', UniTableColumnType.Lookup)
            .setEditable(false);

        const fromCurrencyNameCol = new UniTableColumn('FromCurrencyCode.Name', 'Valuta', UniTableColumnType.Lookup)
            .setEditable(false);

        // Setup table
        this.overridesTable = new UniTableConfig('currency.currencyoverrides', true, true, 25)
            .setColumnMenuVisible(true)
            .setDeleteButton(true)
            .setDefaultRowData({
                ID: 0,
                FromDate: new LocalDate(),
                ToCurrencyCode: this.currencycodes.find(x => x.Code === 'NOK'),
                Factor: 1,
                Source: CurrencySourceEnum.NORGESBANK
            })
            .setChangeCallback((row) => {
                this.isDirty = true;
                const item = row.rowModel;
                item._isDirty = true;

                if (item.FromCurrencyCode) { item.FromCurrencyCodeID = item.FromCurrencyCode.ID; }
                if (item.ToCurrencyCode) { item.ToCurrencyCodeID = item.ToCurrencyCode.ID; }

                return item;
            })
            .setColumns([
                updatedAtCol, fromDateCol, toDateCol, fromCurrencyCodeCol, fromCurrencyNameCol,
                fromCurrencyShortCodeCol, toCurrencyCodeCol, factorCol, exchangeRateCol
            ]);
    }
}
