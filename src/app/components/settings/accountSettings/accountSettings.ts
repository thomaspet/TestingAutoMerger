﻿import {Component} from 'angular2/core';

import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountList, AccountDetails]
})
export class AccountSettings {
    account = 1;
    
    constructor() {
    }
    
    changeAccount(account) {
        this.account = account;
    }    
}