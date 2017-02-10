import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatDeduction} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';


@Injectable()
export class VatDeductionService extends BizHttp<VatDeduction> {

    constructor(http: UniHttp) {
        super(http);

        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = VatDeduction.RelativeUrl;

        this.entityType = VatDeduction.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }
}
