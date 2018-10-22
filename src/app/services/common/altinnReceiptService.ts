import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AltinnReceipt} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class AltinnReceiptService extends BizHttp<AltinnReceipt> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AltinnReceipt.RelativeUrl;
        this.entityType = AltinnReceipt.EntityType;
    }

    public updateAltinnReceipt(id: number): Observable<AltinnReceipt> {
        super.invalidateCache();
        return super.PutAction(id, 'update');
    }
}
