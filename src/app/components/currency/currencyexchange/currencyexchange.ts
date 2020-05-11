import {Component} from '@angular/core';
import {Router} from '@angular/router';
import * as moment from 'moment';

import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {CurrencyService, NumberFormat} from '@app/services/services';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    INumberFormat
} from '@uni-framework/ui/unitable';

@Component({
    selector: 'currencyexchange',
    templateUrl: './currencyexchange.html'
})
export class CurrencyExchange {
    exchangeTable: UniTableConfig;
    exchangelist: any;

    currencyDate = new Date();

    toolbarconfig: IToolbarConfig = {
        title: 'Valutakurser',
    };

    private exchangerateUrlFormat: INumberFormat = {
        thousandSeparator: '',
        decimalSeparator: '.',
        decimalLength: 4,
        postfix: undefined
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
        private router: Router,
        private currencyService: CurrencyService,
        private tabService: TabService,
        private numberFormat: NumberFormat,
        private toastService: ToastService
    ) {
        this.tabService.addTab({
            name: 'Valutakurser',
            url: '/currency/exchange',
            moduleID: UniModules.SubSettings,
            active: true
        });

        this.loadData();
        this.setupExchangeTable();
    }

    public updateToolbar() {
        this.toolbarconfig = {
            title: 'Valutakurser',
            subheads: [
                { title: moment(this.currencyDate).format('DD.MM.YYYY') },
                { title: `(NOK)` }
            ],
            navigation: {
                prev: () => this.addDays(-1),
                next: () => this.addDays(1)
            },
            contextmenu: [
                {
                    label: 'I dag',
                    action: () => {
                        this.currencyDate = new Date();
                        this.loadData();
                    }
                },
                {
                    label: 'Forrige uke',
                    action: () => this.addDays(-7)
                },
                {
                    label: 'Neste uke',
                    action: () => this.addDays(7)
                },
                {
                    label: 'Oppdater valutakurser nå',
                    action: this.downLoadCurrency.bind(this)
                }
            ]
        };
    }

    private addDays(days) {
        this.currencyDate = moment(this.currencyDate).add(days, 'days').toDate();
        this.loadData();
    }

    loadData() {
        this.updateToolbar();
        this.toastService.clear();
        if (moment(this.currencyDate).isAfter(moment(), 'day')) {
            this.toastService.addToast(
                'Du har valgt en fremtidig dato',
                ToastType.warn, 5,
                'Valutakurser som ikke er overstyrt vil være siste tilgjengelige kurs.'
            );
        }

        this.currencyService.getAllExchangeRates(1, this.currencyDate).subscribe(
            list => this.exchangelist = list
        );
    }

    private downLoadCurrency(done) {
        this.currencyService.downloadCurrency().subscribe(res => {
            this.loadData();
            this.toastService.addToast('Nedlasting av valuta er fullført!', ToastType.good, 5);
        }, err => err.handleError(err));
    }

    private setupExchangeTable() {
        const exchangeRateCol = new UniTableColumn('ExchangeRate', 'Kurs', UniTableColumnType.Money)
            .setNumberFormat(this.exchangerateFormat)
            .setTemplate(line => `${line.ExchangeRate * line.Factor}`)
            .setConditionalCls(line => {
                return (moment(this.currencyDate).isAfter(moment(), 'day')) && !line.IsOverrideRate
                    ? 'number-bad' : 'number-good';
            });
        const factorCol = new UniTableColumn('Factor', 'Omregningsenhet', UniTableColumnType.Money)
            .setNumberFormat(this.factorFormat);
        const fromCurrencyCodeCol = new UniTableColumn('FromCurrencyCode', 'Kode', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Code');
        const fromCurrencyShortCodeCol = new UniTableColumn(
            'FromCurrencyCode.ShortCode', '$', UniTableColumnType.Lookup
        );
        const fromCurrencyNameCol = new UniTableColumn('FromCurrencyCode.Name', 'Valuta', UniTableColumnType.Lookup);
        const overridedCol = new UniTableColumn('IsOverrideRate', 'Overstyrt', UniTableColumnType.Text)
            .setTemplate(() => '')
            .setConditionalCls(line => {
                return line.IsOverrideRate ? 'override-column' : '';
            })
            .setFilterable(false);
        const currenyDateDownloadedCol = new UniTableColumn('CurrencyDate', 'Nedlastet', UniTableColumnType.Text);

        const contextMenu = {
            label: 'Overstyr',
            action: (line) => {
                const exchangerate = this.numberFormat.asMoney(
                    line.ExchangeRate * line.Factor, this.exchangerateUrlFormat
                );
                this.router.navigateByUrl(
                    `/currency/overrides;ExchangeRate=${exchangerate};`
                    + `Factor=${line.Factor};FromCurrencyCode=${line.FromCurrencyCode.Code}`
                );
            }
        };

        this.exchangeTable = new UniTableConfig('currency.currencyexchange', false, true, 15)
            .setSearchable(true)
            .setContextMenu([contextMenu])
            .setColumns([
                fromCurrencyCodeCol, fromCurrencyNameCol, fromCurrencyShortCodeCol,
                factorCol, exchangeRateCol, overridedCol, currenyDateDownloadedCol
            ]);
    }
}
