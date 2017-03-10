import {Injectable} from '@angular/core';
import {UniHttp} from '../../../../framework/core/http/http';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {Model} from '../../../unientities';
import {ErrorService} from '../../common/errorService';

@Injectable()
export class ModelService extends BizHttp<Model> {
    constructor(
        http: UniHttp,
        private errorService: ErrorService
    ) {
        super(http);
        this.relativeURL = Model.RelativeUrl;
        this.entityType = Model.EntityType;
        this.defaultExpand = ['Fields'];
    }
}
