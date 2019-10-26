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
        displayFunction: item => `${item.AccountNumber} - ${item.AccountName}`,
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
        if (isNumeric > 0) {
            filter = `startswith(accountnumber,'${lcaseText}')`;
        } else {
            filter = `contains(accountname,'${lcaseText}') or contains(keywords,'${lcaseText}')`;
        }

        filter = (lcaseText === '' ? '' : ('( ' + filter + ' ) and ')) + 'accountnumber ge 4000 and accountnumber le 9000';

        return this.session
            .query('accounts', 'select', 'ID,AccountNumber,AccountName,CustomerID,SupplierID,VatTypeID,Keywords,Description'
                , 'filter', filter, 'orderby', 'AccountNumber', 'top', 50)
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
