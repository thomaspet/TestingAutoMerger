import { Injectable } from '@angular/core';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { TravelType } from '@uni-entities';

@Injectable()
export class TravelTypeService extends BizHttp<TravelType> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = TravelType.RelativeUrl;
        this.entityType = TravelType.EntityType;
    }
}
