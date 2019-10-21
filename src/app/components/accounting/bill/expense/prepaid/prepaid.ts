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

    constructor() {
    }

    ngOnInit() {
        this.loadBankAccounts();
    }

    loadBankAccounts() {
        this.session.statisticsQuery('model=bankaccount&select=ID as ID,AccountID as AccountID'
            + ',BankAccountType as BankAccountType,Account.AccountNumber as AccountNumber'
            + ',Account.AccountName as AccountName,AccountNumber as BankAccountNumber,Bank.Name'
            + ',casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,1,0) as IsDefault'
            + '&filter=companysettingsid gt 0&expand=bank,account'
            + '&join=bankaccount.id eq companysettings.CompanyBankAccountID'
            + '&top=50&distinct=false'
            + '&orderby=casewhen(companysettingsid gt 0 and id eq companysettings.companybankaccountid,0,1)').subscribe( x => {
                this.bankAccounts = x.Data;
                if (x.Data && x.Data.length > 0) {
                    this.onChange(x.Data[0]);
                }
                this.busy = false;
            });
    }

    onChange(value: { AccountID: number, AccountName: string, AccountNumber: number }) {
        this.session.payment.PaidWith = {
            ID: value.AccountID,
            AccountNumber: value.AccountNumber,
            AccountName: value.AccountName,
            VatTypeID: 0
        };
    }
}
