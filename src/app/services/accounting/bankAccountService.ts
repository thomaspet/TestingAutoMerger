import {Injectable, SimpleChange} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BankAccount} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class BankAccountService extends BizHttp<BankAccount> {

    constructor(http: UniHttp) {
        super(http);

        //TODO: should resolve this from configuration based on type (ISupplierInvoice)? Frank is working on something..
        this.relativeURL = BankAccount.RelativeUrl;

        this.entityType = BankAccount.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public deleteRemovedBankAccounts(bc: SimpleChange) {
        if (bc && Array.isArray(bc.previousValue)) {
            bc.previousValue.filter(ba => bc.currentValue.indexOf(ba) === -1).map(ba => {
                if (ba.ID > 0) {
                    this.Remove(ba.ID, 'BankAccount').subscribe(() => {});
                }
            });
        }
    }
}
