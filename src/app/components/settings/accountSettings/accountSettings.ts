import {Component, ViewChild} from "angular2/core";

import {AccountList} from "./accountList/accountList";
import {AccountDetails} from "./accountDetails/accountDetails";
import {UniHttp} from "../../../../framework/core/http";

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
        console.log("SAVED ACCOUNT");
        console.log(account);
        this.accountlist.refresh(account);
    }

    // TEST DATA NOT AVAILABLE DIRECTLY YET

    syncAS() {
        console.log("SYNKRONISER KONTOPLAN");
        this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint("accounts")
            .send({
                "action": "synchronize-ns4102-as"
            })
            .subscribe(
                (response: any) => {
                    alert("Kontoplan synkronisert for AS");
                },
                (error: any) => console.log(error)
            );
    }

    syncVat() {
        console.log("SYNKRONISER MVA");
        this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint("vattypes")
            .send({"action": "synchronize"})
            .subscribe(
                (response: any) => {
                    alert("VatTypes synkronisert");
                },
                (error: any) => console.log(error)
            );
    }

    syncCurrency() {
        console.log("LAST NED VALUTA");
        this.http
            .asGET()
            .withEndPoint("currencies")
            .send({action: "download-from-norgesbank"})
            .subscribe(
                (response: any) => {
                    alert("Valuta lasted ned");
                },
                (error: any) => console.log(error)
            );
    }

    showTestAccount() {
        this.account = -1;
    }
}