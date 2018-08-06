import {Injectable} from '@angular/core';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {DebtCollectionSettings} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';

@Injectable()
export class DebtCollectionSettingsService extends BizHttp<DebtCollectionSettings> {
    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = DebtCollectionSettings.RelativeUrl;
        this.entityType = DebtCollectionSettings.EntityType;

        this.DefaultOrderBy = null;
    }
}
