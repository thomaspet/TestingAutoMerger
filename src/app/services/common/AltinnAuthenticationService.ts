import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AltinnAuthRequest} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';
import {AltinnAuthenticationData} from '../../models/AltinnAuthenticationData';

export class AltinnAuthenticationService extends BizHttp<AltinnAuthRequest> {

    private ALTINN_USER_DATA_LOCALSTORAGE_KEY: string = 'AltinnUserData';

    public loginTypes: {ID: number, text: string}[] = [
        { ID: 1 || null || 0, text: 'AltinnPin'},
        { ID: 2, text: 'SMSPin'},
        { ID: 3, text: 'TaxPin'}
    ];

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = 'altinn';
        this.DefaultOrderBy = null;
    }

    public getPinMessage(altinnAuthRequest: AltinnAuthRequest): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=get-pin-message`)
            .withBody(altinnAuthRequest)
            .send()
            .map(response => response.json());
    }

    public storeAltinnAuthenticationDataInLocalstorage(altinnAuthenticationData: AltinnAuthenticationData) {
        localStorage.setItem(this.ALTINN_USER_DATA_LOCALSTORAGE_KEY, JSON.stringify(altinnAuthenticationData));
    }

    public getAltinnAuthenticationDataFromLocalstorage(): AltinnAuthenticationData {
        return AltinnAuthenticationData.fromObject(JSON.parse(localStorage.getItem(this.ALTINN_USER_DATA_LOCALSTORAGE_KEY)));
    }
}
