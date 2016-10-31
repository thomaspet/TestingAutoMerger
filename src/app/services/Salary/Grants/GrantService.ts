import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Grant} from '../../../unientities';

@Injectable()
export class GrantService extends BizHttp<Grant> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Grant.RelativeUrl;
        this.entityType = Grant.EntityType;
    }

    public delete(ID: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${ID}`)
            .send();
    }
}
