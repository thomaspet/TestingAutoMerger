import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {EHFLog, CompanySettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {RequestMethod} from '@angular/http';
import {CompanySettingsService} from '../common/companySettingsService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
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

        this.updateActivated();
    }

    public activate(activate) {
        super.invalidateCache();
        return this.ActionWithBody(null, activate, 'activate', RequestMethod.Post);
    }

    public updateActivated() {
        this.companySettingsService.Get(1, ["APOutgoing"]).subscribe(settings => {
            this.companySettings$.next(settings);
        });
    }

    public isActivated(format: string): boolean {
        var settings = this.companySettings$.getValue();
        return settings.APActivated && settings.APOutgoing && settings.APOutgoing.some(f => f.Name === format);
    }
}
