import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Email} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class EmailService extends BizHttp<Email> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = "emails"; // TODO: missing Email.RelativeUrl;
        this.entityType = Email.EntityType;

        this.DefaultOrderBy = null;
    }
}
