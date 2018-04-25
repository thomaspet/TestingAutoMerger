import { Injectable } from '@angular/core';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {Travel, ApiKey} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class TravelService extends BizHttp<Travel> {

    constructor(protected http: UniHttp) {
        super(http);
        this.entityType = Travel.EntityType;
        this.relativeURL = Travel.RelativeUrl;
    }

    public ttImport(apiKey: ApiKey): Observable<Travel[]> {
        if (!apiKey) {
            return Observable.of([]);
        }
        return super.PostAction(apiKey.ID, 'traveltext', `ID=${apiKey.ID}`);
    }
}
