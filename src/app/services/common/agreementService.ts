import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Agreement} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@angular/http';

@Injectable()
export class AgreementService extends BizHttp<Agreement> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Agreement.RelativeUrl;
        this.entityType = Agreement.EntityType;
        this.DefaultOrderBy = null;
    }

    public Current(name: string) {
        return this.GetAction(null, `current&name=${name}'`);
    }
}
