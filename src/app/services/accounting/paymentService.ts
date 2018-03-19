import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Payment} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PaymentService extends BizHttp<Payment> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Payment.RelativeUrl;
        this.entityType = Payment.EntityType;
        this.DefaultOrderBy = null;
    }


    public createPaymentBatch(paymentIDs: Array<number>, isManual: boolean = false): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint(this.relativeURL + '?action=create-payment-batch')
            .send()
            .map(response => response.json());
    }

    public getStatusText(statusCode: number): string {
        if (!statusCode) {
            return '';
        } else if (statusCode === 44001) {
            return 'Opprettet';
        } else if (statusCode === 44002) {
            return 'Overført til Bank';
        } else if (statusCode === 44003) {
            return 'Feilet';
        } else if (statusCode === 44004) {
            return 'Fullført';
        } else if (statusCode === 44005) {
            return 'Klar for overføring';
        } else if (statusCode === 44006) {
            return 'Betalt';
        } else if (statusCode === 44007) {
            return 'Overført til meldingssentral';
        } else if (statusCode === 44008) {
            return 'I betalingskø ';
        } else if (statusCode === 44009) {
            return 'Venter på status fra bank ';
        } else if (statusCode === 44010) {
            return 'Avvist av meldingssentral';
        } else if (statusCode === 44011) {
            return 'Manuell overføring';
        } else if (statusCode === 44012) {
            return 'Avvist';
        } else if (statusCode === 44013) {
            return 'Overføring til meldingssentral feilet';
        } else if (statusCode === 44014) {
            return 'Kansellert av bruker';
        } else if (statusCode === 44018) {
            return 'Ingen match';
        }

        return 'Ukjent status: ' + statusCode;
    }
}
