import {Component, ViewChild} from '@angular/core';

import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {Account} from '../../../unientities';

import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountList, AccountDetails, UniSave]
})
export class AccountSettings {    
    @ViewChild(AccountList) private accountlist: AccountList;
    @ViewChild(AccountList) private accountDetails: AccountDetails;

    private accountID: number = 0;
    private hasChanges: boolean = false;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (event) => this.saveSettings(event),
            main: true,
            disabled: false
        }
    ];
    
    constructor() {
    }

    private changeAccount(accountID: number) {
        
        setTimeout(() => {
            let doChange: boolean = true;
            
            if (this.hasChanges) {
                if (!confirm('Du har gjort endringer som ikke er lagret, trykk avbryt hvis du vil lagre først!')) {
                    doChange = false;
                }
            }
            
            if (doChange) {
                this.accountID = accountID;
                this.hasChanges = false;
            }
        });
    }
    
    private change(account: Account) {
        this.hasChanges = true;
    }

    private accountSaved(account: Account) {
        this.accountlist.refresh();
        this.hasChanges = false;        
    }
    
    private saveSettings(event) {
        this.accountDetails.saveAccount();        
    }
}