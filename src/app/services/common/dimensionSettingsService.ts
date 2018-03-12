import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {DimensionSettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class DimensionSettingsService extends BizHttp<DimensionSettings> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = DimensionSettings.RelativeUrl;
        this.entityType = DimensionSettings.EntityType;
        this.DefaultOrderBy = null;
    }
}
