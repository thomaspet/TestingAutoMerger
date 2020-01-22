import { Component, Input, OnInit } from '@angular/core';
import { BankJournalSession } from '@app/services/services';

@Component({
    selector: 'expense-prepaid',
    templateUrl: 'prepaid.html',
    styleUrls: ['prepaid.sass']
})
export class ExpensePrepaid implements OnInit {
    @Input() session: BankJournalSession;

    bankAccounts = [];
    busy = true;
    selectedBankAccount: { AccountID: number, AccountName: string, AccountNumber: number };

    constructor() { }

    ngOnInit() {
        this.loadBankAccounts();
    }

    loadBankAccounts() {
        this.session.getSystemBankAccounts()
            .finally(() => this.busy = false)
            .subscribe( x => this.setBankAccounts(x));
    }

    setBankAccounts(list: Array<any>) {
        this.bankAccounts = list || [];
        if (list && list.length > 0) {
            this.onChange(list[0]);
        }
    }

    clear() {
        if (this.bankAccounts && this.bankAccounts.length > 0) {
            this.selectedBankAccount =  this.bankAccounts[0];
        }
    }

    onChange(value: { AccountID: number, AccountName: string, AccountNumber: number }) {
        this.session.payment.PaidWith = {
            ID: value.AccountID,
            AccountNumber: value.AccountNumber,
            AccountName: value.AccountName,
            VatTypeID: 0,
            superLabel: `${value.AccountNumber} - ${value.AccountName}`
        };
    }
}
