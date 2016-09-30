import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AltinnReceipt} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class AltinnReceiptService extends BizHttp<AltinnReceipt> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AltinnReceipt.RelativeUrl;
        this.entityType = AltinnReceipt.EntityType;
    }
}
