import { Component, Input } from '@angular/core';
import { BankJournalSession, DebitCreditEntry, IAccount } from '@app/services/services';
import { AutocompleteOptions } from '@uni-framework/ui/autocomplete/autocomplete';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'expense-entries',
    templateUrl: 'entries.html',
    styleUrls: ['entries.sass']
})
export class ExpenseEntries {
    @Input() session: BankJournalSession;
    cachedQuery = {};
    accountOptions: AutocompleteOptions = {
        lookup: x => this.lookupAccountByQuery(x),
        openSearchOnFocus: true,
        displayFunction: item => `${item.AccountNumber} - ${item.AccountName}`,
        resultTableColumns: [
            { header: 'Kontonr', field: 'AccountNumber' },
            { header: 'Konto', field: 'AccountName' },
            { header: 'Stikkord', field: 'Keywords' },
            { header: 'Beskrivelse', field: 'Description' },
        ],
        placeholder: 'Søk etter kontonummer, kontonavn eller stikkord'
    };

    private lookupAccountByQuery(txt: string) {
        const lcaseText = this.filterInputAllowPercent(txt.toLowerCase());
        const isNumeric = parseInt(lcaseText, 10);

        const cache = this.cachedQuery[lcaseText];
        if (cache) {
            return Observable.from([cache]);
        }

        let filter = '';
        let sorting = 'AccountNumber';
        if (isNumeric > 0) {
            filter = `startswith(accountnumber,'${lcaseText}')`;
        } else {
            filter = `contains(accountname,'${lcaseText}') or contains(keywords,'${lcaseText}')`;
            sorting = `casewhen(contains(keywords,'${lcaseText}'),0,1),${sorting}`;
        }

        filter = (lcaseText === '' ? '' : ('( ' + filter + ' ) and ')) + 'accountnumber ge 4000 and accountnumber le 9000';

        return this.session
            .squery('model=account', 'select', 'Account.*'
                , 'filter', filter, 'orderby', sorting, 'top', 50, 'distinct', false)
                .pipe(tap(res => { this.cachedQuery[lcaseText] = res; }));
    }

    private filterInputAllowPercent(v: string) {
        return v.replace(/[`~!@#$^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }

    setAccount(item: DebitCreditEntry, value: IAccount) {
        this.session.setValue('Debet', value, this.session.items.indexOf(item));
    }

    addRow() {
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    recalc() {
        this.session.recalc();
    }

    removeRow(row: DebitCreditEntry) {
        const ix = this.session.items.indexOf(row);
        this.session.items.splice( ix, 1);
    }

    dropClick(mse: MouseEvent) {
        if (mse.offsetX > (<any>mse.target).clientWidth - 35) {
            console.log('Drop it down!');
        }
    }

    onEdit(fieldName: string, item: DebitCreditEntry, value: string) {
        console.log('onEdit:' + fieldName, value);
    }
}
