import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {EHFLog, CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@uni-framework/core/http';
import {CompanySettingsService} from '../common/companySettingsService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ActivateAP} from '@app/models/activateAP';

export const AP_NAME_EHF = 'EHF INVOICE';
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

    public activate(service: string, activate: ActivateAP, direction: string) {
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

    serviceMetadata(peppoladdress: string, entitytype: string) {
        const params = `peppoladdress=${peppoladdress}&entitytype=${entitytype}`;
        return this.GetAction(null, 'servicemetadata', params);
    }

    isInvoicePrintActivated(companySettings?: CompanySettings): boolean {
        const settings = companySettings || this.companySettings$.getValue();
        if (settings) {
            return settings.APActivated && settings.APOutgoing && settings.APOutgoing.some(format => {
                return format.Name === AP_NAME_INVOICEPRINT;
            });
        }
    }

    isEHFOutActivated(companySettings?: CompanySettings): boolean {
        const settings = companySettings || this.companySettings$.getValue();
        if (settings) {
            return settings.APActivated && this.activatedOutgoing(settings, AP_NAME_EHF);
        }
    }

    isEHFIncomingActivated(companySettings?: CompanySettings): boolean {
        const settings = companySettings || this.companySettings$.getValue();
        if (settings) {
            return settings.APActivated && this.activatedIncomming(settings, AP_NAME_EHF);
        }
    }

    activatedOutgoing(settings: CompanySettings, AccessPointName: string): boolean {
        if (settings.APOutgoing && settings.APOutgoing.some(format => format.Name.startsWith(AccessPointName))) {
            return true;
        }
        return false;
    }

    activatedIncomming(settings: CompanySettings, AccessPointName: string): boolean {
        if (settings.APIncomming && settings.APIncomming.some(format => format.Name.startsWith(AccessPointName))) {
            return true;
        }
        return false;
    }
}
