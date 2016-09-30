import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AmeldingData} from '../../../unientities';
import {Observable} from 'rxjs/Rx';

export class AMeldingService extends BizHttp<AmeldingData> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = AmeldingData.RelativeUrl;
        this.entityType = AmeldingData.EntityType;
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

    public getAmeldingSumUp(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`ameldingsums/${id}`)
            .send()
            .map(response => response.json());
    }
    
}
