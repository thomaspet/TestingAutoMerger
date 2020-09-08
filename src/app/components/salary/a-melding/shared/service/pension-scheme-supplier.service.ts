import { Injectable } from '@angular/core';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { PensionSchemeSupplier } from '@uni-entities';

@Injectable()
export class PensionSchemeSupplierService extends BizHttp<PensionSchemeSupplier> {

    constructor(protected http: UniHttp) {
        super(http);
        super.entityType = PensionSchemeSupplier.EntityType;
        super.relativeURL = PensionSchemeSupplier.RelativeUrl;
    }
}
