import {Injectable} from '@angular/core';
import { BizHttp } from '@uni-framework/core/http/BizHttp';
import { UniHttp } from '@uni-framework/core/http/http';
import {OtpExportWagetype} from '@uni-entities';

@Injectable()
export class OtpExportWagetypesService extends BizHttp<OtpExportWagetype> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = OtpExportWagetype.RelativeUrl;
        this.entityType = OtpExportWagetype.EntityType;
    }
}
