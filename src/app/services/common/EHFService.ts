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

    public activate(activate) {
        super.invalidateCache();
        return this.ActionWithBody(null, activate, 'activate', RequestMethod.Post);
    }

    public updateActivated() {
        this.companySettingsService.Get(1, ['APOutgoing']).subscribe(settings => {
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
            return settings.APActivated && settings.APOutgoing && settings.APOutgoing.some(format => {
                return format.Name === AP_NAME_EHF;
            });
        }
    }
}
