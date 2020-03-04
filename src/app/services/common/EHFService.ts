import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {EHFLog, CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@uni-framework/core/http';
import {CompanySettingsService} from '../common/companySettingsService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export const AP_NAME_EHF = 'EHF INVOICE 2.0';
export const AP_NAME_INVOICEPRINT = 'NETSPRINT';

@Injectable()
export class EHFService extends BizHttp<EHFLog> {
    public companySettings$: BehaviorSubject<CompanySettings> = new BehaviorSubject(null);

    constructor(
        http: UniHttp,
        private companySettingsService: CompanySettingsService
    ) {
        super(http);

        this.relativeURL = EHFLog.RelativeUrl;
        this.entityType = EHFLog.EntityType;
        this.DefaultOrderBy = null;

        this.http.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.updateActivated();
            }
        });
    }

    public activate(service, activate) {
        let direction;
        if (service === 'invoiceprint') { direction = 'out'; }
        else if (service === 'billing')
        {
            if (activate.incommingInvoice && activate.outgoingInvoice) { direction = 'both'; }
            if (activate.incommingInvoice && !activate.outgoingInvoice) { direction = 'in'; }
            if (!activate.incommingInvoice && activate.outgoingInvoice) { direction = 'out'; }
        }

        super.invalidateCache();
        return this.ActionWithBody(null, {
            orgno: activate.orgnumber,
            orgname: activate.orgname,
            contactname: activate.contactname,
            contactphone: activate.contactphone,
            contactemail: activate.contactemail
        }, 'activate', RequestMethod.Post, `service=${service}&direction=${direction}`);
    }

    public updateActivated() {
        this.companySettingsService.Get(1, ['APOutgoing', 'APIncomming']).subscribe(settings => {
            this.companySettings$.next(settings);
        });
    }

    isInvoicePrintActivated(companySettings?: CompanySettings): boolean {
        const settings = companySettings || this.companySettings$.getValue();
        if (settings) {
            return settings.APActivated && settings.APOutgoing && settings.APOutgoing.some(format => {
                return format.Name === AP_NAME_INVOICEPRINT;
            });
        }
    }

    isEHFActivated(companySettings?: CompanySettings): boolean {
        const settings = companySettings || this.companySettings$.getValue();
        if (settings) {
            return settings.APActivated && this.activatedOutgoingOrIncomming(settings, AP_NAME_EHF);
        }
    }

    activatedOutgoingOrIncomming(settings: CompanySettings, AccessPointName: string): boolean {
        if (settings.APOutgoing && settings.APOutgoing.some(format => format.Name === AccessPointName)) {
            return true;
        }

        if (settings.APIncomming && settings.APIncomming.some(format => format.Name === AccessPointName)) {
            return true;
        }
        return false;
    }
}
