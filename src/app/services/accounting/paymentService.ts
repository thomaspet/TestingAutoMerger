import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Payment} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import { THEMES, theme } from 'src/themes/theme';

@Injectable()
export class PaymentService extends BizHttp<Payment> {

    // THIS IS A LIST CREATED FOR TESTING PREAPPROVED PAYMENTS WITH BANKID..
    whitelistedCompanyKeys = [
        'dba624ee-d722-4cab-9fa1-2e62ee88cdc2',
        '35e5d3ed-e594-4215-9a5d-7557294e0423', // Local
        '535dc5b8-a065-45e7-af3f-d19cb847b69e', // Dennis
        '98257887-d459-4a93-a63d-c6645d0f2120', // Test Tonje-Forhåndsgodkjente betalinger
        'c49a7801-4e02-45a2-9b04-d7f539898daa', // dennis as at rc env
        '4daba3c3-e10d-496b-93b0-aff468c0bc9b',
        '035deeda-5551-4ba5-8dd7-06388a17676a',
        '5a3dc8a9-9a87-4908-90b4-a6fd46068d46'
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Payment.RelativeUrl;
        this.entityType = Payment.EntityType;
        this.DefaultOrderBy = null;
    }

    public createPaymentBatchForAll(isManual: boolean = false, hashAndFilter: string = '') {
        return super.PostAction(null, 'create-payment-batch-for-all-payments', `acceptjob=true&isManual=${isManual}${hashAndFilter}`);
    }

    public createPaymentBatch(paymentIDs: Array<number>, isManual: boolean = false): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint(this.relativeURL + `?action=create-payment-batch&isManual=${isManual}`)
            .send()
            .map(response => response.body);
    }

    public createPaymentBatchWithHash(paymentIDs: Array<number>, hash: string, url: string): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint(this.relativeURL + `?action=create-payment-batch&ismanual=false&createPaymentFile=true&hash=${hash}`)
            .send()
            .map(response => response.body);
    }

    public getHashForPayments(filter: string, expand: string) {
        super.invalidateCache();
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=create-hash-for-payments&filter=${filter}&expand=${expand}`)
            .send()
            .map(response => response.body);
    }

    public getStatusText(statusCode: number): string {
        switch (statusCode) {
            case 44001:
                return 'Opprettet';
            case 44002:
                return theme.theme === THEMES.EXT02 ? 'Mottatt av bank' : 'Overført bank';
            case 44003:
            case 44012:
                return 'Feilet';
            case 44004:
                return 'Fullført';
            case 44005:
                return theme.theme === THEMES.EXT02 ? 'Betalingsfil generert' : 'Fil overført - avventer bankstatus';
            case 44006:
                return 'Betalt';
            case 44007:
                return theme.theme === THEMES.EXT02 ? 'Sendes til bank' : 'Fil mottatt av zdata';
            case 44008:
                return 'I bankens forfallsregister';
            case 44009:
                return 'Overført bank avventer godkjenning';
            case 44010:
                return 'Avvist av zdata';
            case 44011:
                return 'Manuelt overført bank';
            case 44013:
                return 'Kommunikasjonsfeil. Vennligst dobbelsjekk i nettbanken';
            case 44014:
               return 'Kansellert';
            case 44015:
                return 'Avventer godkjenning i nettbanken';
            case 44016:
                return 'Godkjent i nettbanken';
            case 44017:
                return 'Avvist av godkjenner';
            case 44018:
                return 'Ingen match';
            case 44019:
                return 'Slette forespørsel';
            case 44020:
                return 'Skjult';
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

    public updatePaymentsToIgnore(paymentIDs: number[]) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint('payments?action=update-payments-to-ignored')
            .send()
            .map(response => response.body);
    }
}
