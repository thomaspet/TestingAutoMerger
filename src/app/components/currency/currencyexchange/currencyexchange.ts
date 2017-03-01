import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, INumberFormat} from 'unitable-ng2/main';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {
    LocalDate
} from '../../../unientities';

import {
    CurrencyService,
    CurrencyOverridesService,
    CurrencyCodeService,
    ErrorService,
    NumberFormat
} from '../../../services/services';

declare const moment;
declare const _;

@Component({
    selector: 'currencyexchange',
    templateUrl: 'app/components/currency/currencyexchange/currencyexchange.html'
})
export class CurrencyExchange {
    @ViewChild(UniTable)
    private table: UniTable;

    private isBusy: boolean = true;
    private exchangeTable: UniTableConfig;
    private exchangelist: any;
    private inthefuturetoast: number;

    private filter$: BehaviorSubject<any> = new BehaviorSubject({CurrencyDate: new LocalDate(), ShortCode: 'NOK'});
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private toolbarconfig: IToolbarConfig = {
        title: 'Valutakurser',
        omitFinalCrumb: true
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
        private currencyOverridesService: CurrencyOverridesService,
        private tabService: TabService,
        private errorService: ErrorService,
        private currencyCodeService: CurrencyCodeService,
        private numberFormat: NumberFormat,
        private toastService: ToastService
    ) {
        this.tabService.addTab({
            name: 'Valutakurser',
            url: '/currency/exchange',
            moduleID: UniModules.Settings,
            active: true
        });

        this.setupForm();
        this.loadData();
        this.setupExchangeTable();
    }

    public updateToolbar() {
        let filter = this.filter$.getValue();
        let toolbarconfig: IToolbarConfig = {
            title: 'Valutakurser',
            subheads: [
                {title: moment(filter.CurrencyDate).format('DD.MM.YYYY')},
                {title: `(${filter.ShortCode})`}
            ],
            navigation: {
                prev: this.previousDay.bind(this),
                next: this.nextDay.bind(this)
            },
            contextmenu: [
                {
                    label: 'I dag',
                    action: this.today.bind(this)
                },
                {
                    label: 'Forrige uke',
                    action: this.previousWeek.bind(this)
                },
                {
                    label: 'Neste uke',
                    action: this.nextWeek.bind(this)
                }
            ]
        };

        this.toolbarconfig = toolbarconfig;
    }

    public previousDay() {
        this.addDays(-1);
    }

    public nextDay() {
        this.addDays(1);
    }

    public previousWeek() {
        this.addDays(-7);
    }

    public nextWeek() {
        this.addDays(7);
    }

    public today() {
        let filter = this.filter$.getValue();
        filter.CurrencyDate = new LocalDate().toDate();
        this.filter$.next(filter);
        this.loadData();
    }

    private addDays(days) {
        let filter = this.filter$.getValue();
        filter.CurrencyDate = new LocalDate(moment(filter.CurrencyDate).add(days, 'days').toDate());
        this.filter$.next(filter);
        this.loadData();
    }

    private loadData() {
        let filter = this.filter$.getValue();
        this.updateToolbar();
        if (filter.CurrencyDate > new LocalDate()) {
            if (this.inthefuturetoast) { this.toastService.removeToast(this.inthefuturetoast); }
            this.inthefuturetoast = this.toastService.addToast('Du har valgt en fremtidig dato', ToastType.warn, 5, 'Valutakurser som ikke er overstyrt vil være siste tilgjengelige kurs.');
        } else if (this.inthefuturetoast) {
            this.toastService.removeToast(this.inthefuturetoast);
            this.inthefuturetoast = null;
        }
        this.spinner(this.currencyService.getAllExchangeRates(1, filter.CurrencyDate)).subscribe(list => {
            this.exchangelist = list;
        });
    }

    private spinner<T>(source: Observable<T>): Observable<T> {
        this.isBusy = true;
        return <Observable<T>>source.finally(() => this.isBusy = false);
    }

    private onFormFilterChange(event) {
        this.loadData();
    }

    private setupForm() {
        let currencyDate = new UniFieldLayout();
        currencyDate.EntityType = 'ExchangeRates';
        currencyDate.Property = 'CurrencyDate';
        currencyDate.FieldType = FieldType.LOCAL_DATE_PICKER;
        currencyDate.Label = 'Valutakursdato';
        currencyDate.LineBreak = false;

        this.fields$.next([currencyDate]);
    }

    private setupExchangeTable() {
        // Define columns to use in the table
        let exchangeRateCol = new UniTableColumn('ExchangeRate', 'Kurs', UniTableColumnType.Money)
            .setWidth('100px').setFilterOperator('contains')
            .setNumberFormat(this.exchangerateFormat)
            .setTemplate(line => {
                return `${line.ExchangeRate * line.Factor}`;
            })
            .setConditionalCls(line => {
                let filter = this.filter$.getValue();
                return (filter.CurrencyDate > new LocalDate()) && !line.IsOverrideRate ? 'number-bad' : 'number-good';
            });
        let factorCol = new UniTableColumn('Factor', 'Omregningsenhet', UniTableColumnType.Money)
            .setEditable(false)
            .setNumberFormat(this.factorFormat)
            .setFilterOperator('contains')
            .setWidth('50px');
        let fromCurrencyCodeCol = new UniTableColumn('FromCurrencyCode', 'Kode', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Code')
            .setWidth('60px')
            .setEditable(false);
        let fromCurrencyShortCodeCol = new UniTableColumn('FromCurrencyCode.ShortCode', '$', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.ShortCode')
            .setWidth('30px')
            .setEditable(false);
        let fromCurrencyNameCol = new UniTableColumn('FromCurrencyCode.Name', 'Valuta', UniTableColumnType.Lookup)
            .setDisplayField('FromCurrencyCode.Name')
            .setEditable(false)
            .setWidth('10%');
        let overridedCol = new UniTableColumn('IsOverrideRate', 'Overstyrt', UniTableColumnType.Text, false).setFilterOperator('contains')
            .setTemplate(line => '')
            .setConditionalCls(line => {
                return line.IsOverrideRate ? 'override-column' : '';
            })
            .setWidth('20px')
            .setFilterable(false)
            .setEditable(false)
            .setSkipOnEnterKeyNavigation(true);

        let contextMenu = {
            label: 'Overstyr',
            action: (line) => {
                let exchangerate = this.numberFormat.asMoney(line.ExchangeRate * line.Factor, this.exchangerateUrlFormat);
                this.router.navigateByUrl(`/currency/overrides;ExchangeRate=${exchangerate};Factor=${line.Factor};FromCurrencyCode=${line.FromCurrencyCode.Code}`);
            }
        };

        // Setup table
        this.exchangeTable = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(false)
            .setMultiRowSelect(false)
            .setAutoAddNewRow(false)
            .setContextMenu([contextMenu])
            .setColumns([fromCurrencyCodeCol, fromCurrencyNameCol, fromCurrencyShortCodeCol, factorCol, exchangeRateCol, overridedCol]);
    }
}
