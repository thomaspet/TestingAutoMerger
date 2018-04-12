import { Injectable } from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGASums, FreeAmountSummary, ApiKey} from '../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ApiKeyService extends BizHttp<ApiKey> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'apikeys';
    }

    public getApiKeys(): Observable<ApiKey[]> {
        return super.GetAll('');
    }
}
