import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {BasicAmount} from '../../../unientities';

@Injectable()
export class BasicAmountService extends BizHttp<BasicAmount> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BasicAmount.RelativeUrl;
        this.entityType = BasicAmount.EntityType;
    }

    public getBasicAmounts() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('basicamounts')
            .send()
            .map(response => response.json());
    }
}
