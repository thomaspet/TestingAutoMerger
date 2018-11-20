import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentBatch} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class BankFileDownloadService extends BizHttp<PaymentBatch> {
    constructor(http: UniHttp) {
        super(http);
        this.DefaultOrderBy = null;
    }

    public DownloadBankFiles(password: string): Observable<any> {
        super.invalidateCache();

        const payload = {'Password': password};
        return this.http
            .asPOST()
            .usingEmptyDomain()
            .withBody(payload)
            .withEndPoint('api/bank/download')
            .send()
            .map(response => response.json());
    }
}
