import { Injectable } from '@angular/core';
import { BizHttp } from '../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../framework/core/http/http';
import { AGASums, FreeAmountSummary, ApiKey, TypeOfIntegration, StatusCodeApiKey } from '../../unientities';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyService extends BizHttp<ApiKey> {

    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = 'apikeys';
    }

    private integrationtypes: { ID: TypeOfIntegration, Name: string }[] = [
        { ID: TypeOfIntegration.TravelAndExpenses, Name: 'Reiseregning' },
        { ID: TypeOfIntegration.Aprila, Name: 'Aprila' }
    ];

    private statusCodes: { ID: StatusCodeApiKey, Name: string }[] = [
        { ID: StatusCodeApiKey.Active, Name: 'Active' },
        { ID: StatusCodeApiKey.Approved, Name: 'Approved' },
        { ID: StatusCodeApiKey.Denied, Name: 'Denied' },
        { ID: StatusCodeApiKey.InActive, Name: 'InActive' },
        { ID: StatusCodeApiKey.InProgress, Name: 'In Progress' },
        { ID: StatusCodeApiKey.WaitingForApproval, Name: 'Waiting for Approval' }
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

    public setIntegrationKey(id: number, key: string) {
        return super.PutAction(null, 'setintegrationkey', `integrationID=${id}&integrationkey=${key}`);
    }

    public save(apikey: ApiKey): Observable<ApiKey> {
        return apikey.ID ? super.Put(apikey.ID, apikey) : super.Post(apikey);
    }

    public getStatusCodeText(apikey: ApiKey) {
        if (apikey) {
            const statusCode = this.statusCodes.find(x => x.ID === apikey.StatusCode);
            return statusCode ? statusCode.Name : '';
        } else {
            return '';
        }
    }
}
