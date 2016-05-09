import {Component, ViewChild} from "@angular/core";

import {AccountList} from "./accountList/accountList";
import {AccountDetails} from "./accountDetails/accountDetails";
import {UniHttp} from "../../../../framework/core/http/http";

@Component({
    selector: "account-settings",
    templateUrl: "app/components/settings/accountSettings/accountSettings.html",
    directives: [AccountList, AccountDetails]
})
export class AccountSettings {
    account = 0;
    @ViewChild(AccountList) accountlist: AccountList;

    constructor(private http: UniHttp) {
    }

    changeAccount(account) {
        this.account = account;
    }

    accountSaved(account) {
        this.accountlist.refresh(account);
    }
}