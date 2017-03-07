import {Injectable, SimpleChange} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {RequestMethod} from '@angular/http';
import {BankAccountService} from '../accounting/bankAccountService';
import {ErrorService} from '../common/errorService';

@Injectable()
export class BusinessRelationService extends BizHttp<BusinessRelation> {

    constructor(http: UniHttp, private bankaccountService: BankAccountService, private errorService: ErrorService) {
        super(http);
        this.relativeURL = BusinessRelation.RelativeUrl;
        this.entityType = BusinessRelation.EntityType;
        this.DefaultOrderBy = null;
    }

    public search(searchText: string): Observable<any> {
        return this.Action(null, 'search-data-hotel', 'searchText=' + searchText, RequestMethod.Get);
    }

    public deleteRemovedBankAccounts(bc: SimpleChange, brInfo: BusinessRelation) {
        if (bc && Array.isArray(bc.previousValue)) {
            bc.previousValue.filter(ba => bc.currentValue.indexOf(ba) === -1).map(ba => {
                if (ba === brInfo.DefaultBankAccount) {
                    brInfo.DefaultBankAccount = null;
                    brInfo.DefaultBankAccountID = null;
                    // Update brInfo first because of delete restriction
                    this.Put(brInfo.ID, brInfo).subscribe(() => {
                        this.bankaccountService.Remove(ba.ID, 'BankAccount').subscribe(() => {}, (err) => {
                            this.errorService.handle(err);
                        });
                    });
                } else if (ba.ID > 0) {
                    this.bankaccountService.Remove(ba.ID, 'BankAccount').subscribe(() => {}, (err) => {
                        this.errorService.handle(err);
                    });
                }
            });
        }
    }
}
