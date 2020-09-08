import {Component, Input} from '@angular/core';
import {SupplierInvoiceStore} from '../../supplier-invoice-store';
import {JournalEntryLineDraft} from '@uni-entities';
import {Subject, Observable} from 'rxjs';
import {takeUntil, take, shareReplay} from 'rxjs/operators';
import {GuidService, StatisticsService, CurrencyCodeService, NumberFormat} from '@app/services/services';
import * as _ from 'lodash';

interface ITotalObject {
    net?: number;
    vat?: number;
    sum?: number;
    diff?: number;
    class?: string;
}

@Component({
    selector: 'journal-lines',
    templateUrl: './journal-lines.html',
    styleUrls: ['./journal-lines.sass'],
    host: {
        '(document:keydown)': 'handleKeyboardEvents($event)'
    }
})
export class JournalLines {

    @Input()
    vatTypes = [];

    @Input()
    currentMode: number = 3;

    filteredVatTypes = [];
    lines: JournalEntryLineDraft[];
    onDestroy$ = new Subject();
    readonly = true;
    total: ITotalObject = {
        net: 0,
        vat: 0,
        sum: 0,
        diff: 0,
        class: ''
    };

    selectConfig = {
        template: (item) => item ? `${item.VatPercent}% - ${item.Name}` : '',
        searchable: false,
        hideDeleteButton: true
    };

    accountLookupCache: {[odata: string]: Observable<any[]>} = {};
    accountAutocompleteOptions = {
        lookup: query => this.accountLookup(query),
        displayFunction: item => `${item.AccountNumber} - ${item.AccountName}`,
        // placeholder: 'Søk etter kontonummer, kontonavn eller stikkord',
        // openSearchOnClick: true,
        resultTableColumns: [
            { header: 'Kontonr', field: 'AccountNumber' },
            { header: 'Konto', field: 'AccountName' },
            { header: 'Stikkord', field: 'Keywords' },
            { header: 'Beskrivelse', field: 'Description' },
        ],
    };

    invoiceTypeConfig = {
        template: item => item.label,
        searchable: false,
        hideDeleteButton: true
    };

    currencyConfig = {
        template: item => item && item.Code !== item.Name ? item.Code + ' - ' + item.Name : item.Code,
        searchable: false,
        hideDeleteButton: true
    };

    currencyCodes = [];
    currency;

    invoiceTypes = [
        { value: 0, label: 'Innkjøp i Norge' },
        { value: 1, label: 'Varer kjøpt i utlandet' },
        { value: 2, label: 'Tjenester kjøpt i utlandet' },
    ];
    currentInvoiceType = this.invoiceTypes[0];

    constructor(
        public store: SupplierInvoiceStore,
        private guidService: GuidService,
        private statisticsService: StatisticsService,
        private currencyCodeService: CurrencyCodeService,
        private numberFormatter: NumberFormat,
    ) {
        this.currencyCodeService.GetAll().subscribe(codes => {
            this.currencyCodes = codes;
            this.currency = codes[0];

            this.store.journalEntryLines$.pipe(
                takeUntil(this.onDestroy$)
            ).subscribe(lines => {
                this.lines = (lines || []).map((line, i) => {
                    line.VatType = line.VatType || null;
                    const formattedValue = this.format(line.AmountCurrency);
                    if (formattedValue) {
                        setTimeout(() => {
                            const el = <HTMLInputElement>document.getElementsByClassName('number-input-fields')[i];
                            if (el) {
                                el.value = formattedValue;
                            }
                        }, 0);
                    }
                    return line;
                });

                this.recalcDiff();
            });
            this.store.readonly$.pipe(takeUntil(this.onDestroy$)).subscribe(readonly => this.readonly = readonly);
        });
    }

    // Lets user navigate with enter
    handleKeyboardEvents(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            const elements = document.getElementById('lines-container').getElementsByTagName('input');

            for (let i = 0; i < elements.length; i++) {
                if (elements[i] === document.activeElement && !!elements[i + 1]) {
                    elements[i + 1].focus();
                    i = elements.length + 1;
                }
            }


        }
    }

    ngOnChanges(event) {
        if (event['vatTypes'] && event['vatTypes'].currentValue) {
            this.filterVatTypesForDropdown();
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    filterVatTypesForDropdown() {
        this.filteredVatTypes = this.vatTypes.filter(type => {
            if (this.currentInvoiceType.value === 0) {
                return !['20', '21', '22', '86', '87', '88', '89'].includes(type.VatCode) && !type.OutputVat;
            } else if (this.currentInvoiceType.value === 1) {
                return ['20', '21', '22'].includes(type.VatCode);
            } else {
                return ['86', '87', '88', '89'].includes(type.VatCode);
            }
        });
    }

    addDraftLine() {
        const lines = this.lines;
        const invoice = this.store.invoice$.value;

        let restAmount = 0;
        if (this.store.currentMode === 0) {
            restAmount = invoice.TaxInclusiveAmountCurrency -
                this.lines.map(l => parseFloat((l.AmountCurrency + '').replace(',', '.'))).reduce((a, b) => a + b);
        }

        const newLine = <JournalEntryLineDraft> {
            _createguid: this.guidService.guid(),
            FinancialDate: invoice?.InvoiceDate,
            VatDate: invoice?.InvoiceDate,
            Amount: restAmount,
            AmountCurrency: restAmount
        };

        lines.push(newLine);
        this.store.journalEntryLines$.next(lines);
        this.recalcDiff();
    }

    removeLine(index: number) {
        const line = this.lines[index];
        if (line.ID) {
            line.Deleted = true;
            this.store.changes$.next(true);
        } else {
            this.lines.splice(index, 1);
        }

        this.store.journalEntryLines$.next(this.lines);
        this.recalcDiff();
    }

    onAccountChange(index: number, line: JournalEntryLineDraft) {
        const shouldUpdateVat = line.Account?.VatTypeID && this.filteredVatTypes.map(v => v.ID).includes(line.Account?.VatTypeID);
        this.store.updateJournalEntryLine(index, 'Account', line.Account, shouldUpdateVat);
    }

    onInvoiceTypeChange(event) {
        this.currentInvoiceType = event;
        this.filterVatTypesForDropdown();

        let vatType = null;
        if (event.value === 1) {
            vatType = this.filteredVatTypes.find(vt => vt.VatCode === '21');
        } else if (event.value === 2) {
            vatType = this.filteredVatTypes.find(vt => vt.VatCode === '86');
        }

        this.lines.forEach(line => {
            line.VatType = vatType;
            line.VatTypeID = vatType?.ID || null;
        });
    }

    onCurrencyChange(event) {
        this.currency = event;
        const invoice = this.store.invoice$.value;
        invoice.CurrencyCodeID = event.ID;
        this.store.invoice$.next(invoice);

        this.lines.forEach(line => line.CurrencyCodeID = event.ID);
    }

    onVatTypeChange(event, index: number) {
        this.store.updateJournalEntryLine(index, 'VatType', event);
    }

    private recalcDiff() {
        const invoice = this.store.invoice$.value;

        this.total.vat = 0;
        this.total.net = 0;
        this.total.sum = 0;
        this.total.diff = 0;

        this.lines.filter(line => !line.Deleted).forEach(line => {
            if (line.AmountCurrency) {

                let amount: any = line.AmountCurrency + '';
                amount = parseFloat(amount.replace(',', '.'));

                line.Amount = amount * (line.CurrencyExchangeRate || 1);
                const net = !line.VatType ? amount : amount / ( 1 + ( line.VatType.VatPercent / 100 ) );
                this.total.vat += amount - net;
                this.total.sum += amount || 0;
                this.total.net += net;
            }
        });

        if (invoice) {
            this.total.diff = invoice.TaxInclusiveAmountCurrency - this.total.sum;
        }
    }

    private accountLookup(query: string) {
        const isNumeric = !!parseInt(query, 10);

        let orderby = 'AccountNumber';
        let filter = '';

        if (query) {
            if (isNumeric) {
                filter += `startswith(accountnumber,'${query}')`;
            } else {
                filter = `contains(accountname,'${query}') or contains(keywords,'${query}')`;
                orderby = `casewhen(contains(keywords,'${query}'),0,1),${orderby}`;
            }
        }

        filter = (filter ? `( ${filter} ) and ` : '') + 'accountnumber ge 1000 and accountnumber le 9000';

        const odata = `model=Account&select=Account.*&filter=${filter}&orderby=${orderby}&top=50&distinct=false`;

        if (!this.accountLookupCache[odata]) {
            this.accountLookupCache[odata] = this.statisticsService.GetAllUnwrapped(odata).pipe(shareReplay(1));
        }

        return this.accountLookupCache[odata].pipe(take(1));
    }

    blurHandler(e) {
        const input = e.target;
        input.value = this.format(input.value);
    }

    private format(value: number): string {
        if (!value) {
            return;
        }

        const parsed = this._parseValue((value || '').toString());

        return this.numberFormatter.asNumber(parsed, {
            decimalLength: 2,
            thousandSeparator: ' '
        });
    }

    private _parseValue(value): number {
        if (_.isNumber(value)) {
            return value;
        }

        if (value === null || value === undefined) {
            return null;
        }

        value = value.replace(' ', '');
        value = value.replace(',', '.');

        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }
}
