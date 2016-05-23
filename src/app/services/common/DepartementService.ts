import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Departement} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

export class DepartementService extends BizHttp<Departement> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = Departement.RelativeUrl;
        this.DefaultOrderBy = null;
    }       
}