import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Bank} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {BankData} from '../../models/models';

@Injectable()
export class BankService extends BizHttp<Bank> {

    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = Bank.RelativeUrl;
        
        this.entityType = Bank.EntityType;

        this.DefaultOrderBy = null;
    }

    public getIBANUpsertBank(bankAccountNumber: string): Observable<BankData> {
        return super.GetAction(null, `get-iban-upsert-bank&bankaccountnumber=${bankAccountNumber}`);
    }
    
    public getBankFromAccountNumberLookup(bankAccountNumber: string): Observable<Bank> {
        return super.GetAction(null, `get-bank-from-accountnumber-lookup&bankaccountnumber=${bankAccountNumber}`);
    }

    public getIBANFromAccountNumberLookup(bankAccountNumber: string): Observable<String> {
        return super.GetAction(null, `get-iban-from-accountnumber-lookup&bankaccountnumber=${bankAccountNumber}`);
    }
}
