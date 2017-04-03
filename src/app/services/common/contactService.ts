import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Contact} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class ContactService extends BizHttp<Contact> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Contact.RelativeUrl;
        this.entityType = Contact.EntityType;
        this.DefaultOrderBy = null;
    }
}
