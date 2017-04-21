import {Injectable, SimpleChange} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BankAccount} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {ToastService, ToastTime, ToastType} from "../../../framework/uniToast/toastService";

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
        return new Promise((resolve,reject) => {
            if (bc && Array.isArray(bc.previousValue)) {
                bc.previousValue.filter(ba => bc.currentValue.indexOf(ba) === -1).map(ba => {
                    if (ba.ID > 0) {
                        this.Remove(ba.ID, 'BankAccount')
                            .subscribe(() => {
                                this.toastr.addToast('Account Removed', ToastType.good, ToastTime.short);
                                resolve(true);
                            }, (error) => {
                                this.toastr.addToast('Error removing account', ToastType.bad, ToastTime.short, error.json().Message);
                                reject(ba);
                            });
                    } else {
                        resolve(false);
                    }
                });
            }
        });
    }
}
