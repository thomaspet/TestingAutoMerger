import {Component} from '@angular/core';
import {SupplierInvoiceStore} from '../../supplier-invoice-store';
import {JournalEntryLineDraft} from '@uni-entities';
import {Subject, Observable} from 'rxjs';
import {takeUntil, take, shareReplay, refCount} from 'rxjs/operators';
import {GuidService, StatisticsService} from '@app/services/services';

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
    styleUrls: ['./journal-lines.sass']
})
export class JournalLines {
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

    constructor(
        public store: SupplierInvoiceStore,
        private guidService: GuidService,
        private statisticsService: StatisticsService
    ) {
        this.store.journalEntryLines$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(lines => {
            this.lines = (lines || []).map(line => {
                line.VatType = line.VatType || null;
                return line;
            });

            this.recalcDiff();
        });

        this.store.readonly$.pipe(takeUntil(this.onDestroy$)).subscribe(readonly => this.readonly = readonly);

    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    addDraftLine() {
        const lines = this.lines;
        const invoice = this.store.invoice$.value;

        const newLine = <JournalEntryLineDraft> {
            _createguid: this.guidService.guid(),
            FinancialDate: invoice?.InvoiceDate,
            VatDate: invoice?.InvoiceDate,
        };

        lines.push(newLine);
        this.store.journalEntryLines$.next(lines);
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
        this.store.updateJournalEntryLine(index, 'Account', line.Account);
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
            line.Amount = line.AmountCurrency * line.CurrencyExchangeRate;
            this.total.net = !line.VatType ? line.AmountCurrency : line.AmountCurrency / ( 1 + ( line.VatType.VatPercent / 100 ) );
            this.total.vat += line.AmountCurrency - this.total.net;
            this.total.sum += line.AmountCurrency || 0;
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

        filter = (filter ? `( ${filter} ) and ` : '') + 'accountnumber ge 4000 and accountnumber le 9000';

        const odata = `model=Account&select=Account.*&filter=${filter}&orderby=${orderby}&top=50&distinct=false`;

        if (!this.accountLookupCache[odata]) {
            this.accountLookupCache[odata] = this.statisticsService.GetAllUnwrapped(odata).pipe(shareReplay(1));
        }

        return this.accountLookupCache[odata].pipe(take(1));
    }
}
