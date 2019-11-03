import {Injectable, SimpleChange} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BankAccount} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {ToastService, ToastTime, ToastType} from "../../../framework/uniToast/toastService";
import {Observable} from 'rxjs';

@Injectable()
export class BankAccountService extends BizHttp<BankAccount> {

    constructor(http: UniHttp, public toastr: ToastService) {
        super(http);

        //TODO: should resolve this from configuration based on type (ISupplierInvoice)? Frank is working on something..
        this.relativeURL = BankAccount.RelativeUrl;

        this.entityType = BankAccount.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public deleteRemovedBankAccounts(bc: SimpleChange) {
        return new Promise((resolve, reject) => {
            if (bc && Array.isArray(bc.previousValue)) {
                bc.previousValue.filter(ba => bc.currentValue.indexOf(ba) === -1).map(ba => {
                    if (ba.ID > 0) {
                        this.Remove(ba.ID, 'BankAccount').subscribe(
                            () => {
                                this.toastr.addToast('Account Removed', ToastType.good, ToastTime.short);
                                resolve(true);
                            },
                            (err) => {
                                this.toastr.addToast('Error removing account', ToastType.bad, ToastTime.short, err.error.Message);
                                reject(ba);
                            }
                        );
                    } else {
                        resolve(false);
                    }
                });
            }
        });
    }



    public getConnectedBankAccounts(accountID: number, skipBankAccountID: number): Observable<BankAccount[]> {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + `?action=get-connected-bankaccounts-to-account`
        + `&accountID=${accountID}`
        + `&skipBankAccountID=${skipBankAccountID}`)
        .send()
        .map(response => response.body);
    }



    public deleteBankAccount(ID: number) {
        return this.http
            .asDELETE()
            .withEndPoint('/bankaccounts/' + ID)
            .usingBusinessDomain()
            .send()
            .map(res => res.body);
    }

    public getBankBalance(ID: number) {
        if (ID) {
            return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${ID}?action=bank-balance`)
            .send()
            .map(res => res.body);
        } else {
            return Observable.of(0);
        }
    }

    getAccountFromAccountNumber(accountNumber: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`/accounts?filter=AccountNumber eq '${accountNumber}'`)
            .send()
            .map(res => res.body);
    }
}
