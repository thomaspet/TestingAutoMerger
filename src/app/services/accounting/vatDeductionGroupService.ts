import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatDeductionGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';


@Injectable()
export class VatDeductionGroupService extends BizHttp<VatDeductionGroup> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = VatDeductionGroup.RelativeUrl;
        this.entityType = VatDeductionGroup.EntityType;
        this.DefaultOrderBy = 'Name';
    }
}
