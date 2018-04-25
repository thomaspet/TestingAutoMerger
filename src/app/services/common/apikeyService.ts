import { Injectable } from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {AGASums, FreeAmountSummary, ApiKey, TypeOfIntegration} from '../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ApiKeyService extends BizHttp<ApiKey> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'apikeys';
    }

    private integrationtypes: {ID: TypeOfIntegration, Name: string}[] = [
        {ID: TypeOfIntegration.TravelAndExpenses, Name: 'Reiserekning'}
    ];

    public getApiKeys(): Observable<ApiKey[]> {
        return super.GetAll('');
    }

    public getApiKey(type: TypeOfIntegration): Observable<ApiKey> {
        return super.GetAll(`IntegrationType eq ${type}`).map(res => res[0]);
    }

    public getIntegrationTypes() {
        return this.integrationtypes;
    }

    public getIntegrationTypeText(apikey: ApiKey) {
        if (apikey) {
            const intType = this.integrationtypes.find(x => x.ID === apikey.IntegrationType);
            return intType ? intType.Name : '';
        } else {
            return '';
        }
    }
}
