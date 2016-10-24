import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AmeldingData} from '../../../unientities';
import {Observable} from 'rxjs/Rx';
import {AltinnAuthenticationData} from '../../../models/AltinnAuthenticationData';

@Injectable()
export class AMeldingService extends BizHttp<AmeldingData> {

    public internalAmeldingStatus: Array<any> = [
        {Code: 1, Text: 'Generert'},
        {Code: 2, Text: 'Innsendt'},
        {Code: 3, Text: 'Tilbakemelding hentet'}
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AmeldingData.RelativeUrl;
        this.entityType = AmeldingData.EntityType;
    }

    public getAMeldingWithFeedback(id: number | string): Observable<any> {
        if (id !== 0) {
            return this.Get(id);
        }
    }
    
    public getAMeldingForPeriod(periode: number): Observable<AmeldingData[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL)
            .send({filter: 'period eq ' + periode})
            .map(response => response.json());
    }

    public getAMeldingFile(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=get-amelding`)
            .send()
            .map(response => response.json());
    }

    public sendAMelding(id: number) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=send`)
            .send()
            .map(response => response.json());
    }

    public postAMeldingforDebug(period: number, amldType: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody( {
                'period': period,
                'year': 2016,
                'type': amldType,
                'replacesID': 0
            })
            .withEndPoint(this.relativeURL)
            .send()
            .map(response => response.json());
    }

    public getAmeldingFeedback(id: number, authData: AltinnAuthenticationData): Observable<AmeldingData> {
        const headers = {
            'x-altinn-userid': authData.userID,
            'x-altinn-password': authData.password,
            'x-altinn-pinmethod': authData.preferredLogin,
            'x-altinn-pin': authData.pin
        };
        
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(this.relativeURL + `/${id}?action=feedback`)
            .send()
            .map(response => response.json());
    }

    public getAmeldingSumUp(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`ameldingsums/${id}`)
            .send()
            .map(response => response.json());
    }
}
