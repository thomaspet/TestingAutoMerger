import {Component} from 'angular2/core';

import {AccountList} from './accountList/accountList';
import {AccountDetails} from './accountDetails/accountDetails';
import {UniHttpService} from '../../../../framework/data/uniHttpService';

@Component({
    selector: 'account-settings',
    templateUrl: 'app/components/settings/accountSettings/accountSettings.html',
    directives: [AccountList, AccountDetails]
})
export class AccountSettings {
    account = 0;
    
    constructor(private http:UniHttpService) {
    }
    
    changeAccount(account) {
        this.account = account;
    }    
    
    // TEST DATA NOT AVAILABLE DIRECTLY YET
    
    syncAS()
    {
        console.log("SYNKRONISER KONTOPLAN");
        this.http.put({
            resource: "accounts",
            action: "synchronize-ns4102-as"
        }).subscribe(
            (response) => {
                   alert("Kontoplan synkronisert for AS");
            },
            (error) => console.log(error)
        );
    }
    
    syncVat()
    {
        console.log("SYNKRONISER MVA");
        this.http.put({
            resource: "vattypes",
            action: "synchronize"
        }).subscribe(
            (response) => {
                   alert("VatTypes synkronisert");
            },
            (error) => console.log(error)
        );
    }
    
    syncCurrency()
    {
        console.log("LAST NED VALUTA");
        this.http.get({
            resource: "currencies",
            action: "download-from-norgesbank"
        }).subscribe(
            (response) => {
                alert("Valuta lasted ned");
            },
            (error) => console.log(error)
        );
    }

    showTestAccount()
    {
        this.account = -1;
    }
}