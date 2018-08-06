import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {DebtCollectionAutomation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class DebtCollectionAutomationService extends BizHttp<DebtCollectionAutomation> {
    
    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = DebtCollectionAutomation.RelativeUrl;
        this.entityType = DebtCollectionAutomation.EntityType;
        this.DefaultOrderBy = null;
    }       
}
