import {Component, ViewChild} from '@angular/core';

import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {Account} from '../../../unientities';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountList, AccountDetails]
})
export class AccountSettings {    
    @ViewChild(AccountList) private accountlist: AccountList;

    private accountID: number = 0;

    constructor() {
    }

    private changeAccount(accountID: number) {
        this.accountID = accountID;
    }

    private accountSaved(account: Account) {
        this.accountlist.refresh();
    }
}