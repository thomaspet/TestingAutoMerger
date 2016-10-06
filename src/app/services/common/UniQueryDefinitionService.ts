import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniQueryDefinition} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class UniQueryDefinitionService extends BizHttp<UniQueryDefinition> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = UniQueryDefinition.RelativeUrl;
        this.DefaultOrderBy = null;
        this.entityType = UniQueryDefinition.EntityType;
    }
}
