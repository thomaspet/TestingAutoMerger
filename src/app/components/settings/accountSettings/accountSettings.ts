import {Component, ViewChild} from '@angular/core';

import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {Account} from '../../../unientities';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountList, AccountDetails]
})
export class AccountSettings {    
    @ViewChild(AccountList) private accountlist: AccountList;

    private accountID: number = 0;

    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Kontoinstillinger', url: '/accounting/accountsettings', moduleID: 10, active: true })
    }

    private changeAccount(accountID: number) {
        this.accountID = accountID;
    }

    private accountSaved(account: Account) {
        this.accountlist.refresh();
    }
}