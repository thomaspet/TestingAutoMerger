import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Currency} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class CurrencyService extends BizHttp<Currency> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Currency.RelativeUrl;
        this.entityType = Currency.EntityType;
        this.DefaultOrderBy = null;
    }       
}
