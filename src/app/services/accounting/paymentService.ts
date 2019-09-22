import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Payment} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class PaymentService extends BizHttp<Payment> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Payment.RelativeUrl;
        this.entityType = Payment.EntityType;
        this.DefaultOrderBy = null;
    }

    public createPaymentBatchForAll() {
        return super.PostAction(null, 'create-payment-batch-for-all-payments');
    }

    public createPaymentBatch(paymentIDs: Array<number>, isManual: boolean = false): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint(this.relativeURL + '?action=create-payment-batch')
            .send()
            .map(response => response.body);
    }

    public getStatusText(statusCode: number): string {
        switch (statusCode) {
            case 44001:
                return 'Opprettet';
            case 44002:
            case 44005:
            case 44007:
            case 44008:
                return 'Overført bank';
            case 44009:
                return 'Overført bank avventer godkjenning';
            case 44011:
                return 'Manuelt overført bank';
            case 44006:
                return 'Betalt';
            case 44004:
                return 'Fullført';
            case 44013:
                    return 'Kommunikasjonsfeil. Vennligst dobbelsjekk i nettbanken';
            case 44003:
            case 44010:
            case 44012:
            case 44014:
                return 'Feilet';
            case 44018:
                return 'Ingen match';
            case 44019:
                return 'Slette forespørsel';
            default:
                return 'Ukjent status: ' + statusCode;
        }
    }

    public cancelPaymentClaim(ids: number[]) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('/payments?action=batch-cancel-payment-claims')
            .withBody(ids)
            .send()
            .map(response => response.body);
    }
}
