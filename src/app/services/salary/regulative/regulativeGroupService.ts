import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { RegulativeGroup, Regulative } from '@uni-entities';
import { Injectable } from '@angular/core';

@Injectable()
export class RegulativeGroupService extends BizHttp<RegulativeGroup> {
    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = RegulativeGroup.RelativeUrl;
        this.entityType = RegulativeGroup.EntityType;
    }
}
