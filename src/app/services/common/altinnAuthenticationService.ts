import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AltinnAuthRequest} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {AltinnAuthenticationData} from '../../models/AltinnAuthenticationData';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Injectable()
export class AltinnAuthenticationService extends BizHttp<AltinnAuthRequest> {

    private ALTINN_USER_DATA_LOCALSTORAGE_KEY: string = 'AltinnUserData';

    public loginTypes: {ID: number, text: string}[] = [
        { ID: 1 || null || 0, text: 'AltinnPin'},
        { ID: 2, text: 'SMSPin'},
        { ID: 3, text: 'TaxPin'}
    ];

    constructor(
        http: UniHttp,
        private browserStorage: BrowserStorageService,
    ) {
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
            .map(response => response.body);
    }

    public storeAltinnAuthenticationDataInLocalstorage(altinnAuthenticationData: AltinnAuthenticationData) {
        this.browserStorage.setItem(this.ALTINN_USER_DATA_LOCALSTORAGE_KEY, altinnAuthenticationData);
    }

    public getAltinnAuthenticationDataFromLocalstorage(): AltinnAuthenticationData {
        return AltinnAuthenticationData.fromObject(this.browserStorage.getItem(this.ALTINN_USER_DATA_LOCALSTORAGE_KEY));
    }

    public clearAltinnAuthenticationDataFromLocalstorage()    {
        this.browserStorage.removeItem(this.ALTINN_USER_DATA_LOCALSTORAGE_KEY);
    }

    public clearAltinnPinFromLocalStorage() {
        const auth = this.getAltinnAuthenticationDataFromLocalstorage();
        auth.pin = '';
        this.storeAltinnAuthenticationDataInLocalstorage(auth);
    }
}
