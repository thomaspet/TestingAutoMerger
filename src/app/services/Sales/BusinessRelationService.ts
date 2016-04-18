import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class BusinessRelationService extends BizHttp<BusinessRelation> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = BusinessRelation.relativeUrl;
        this.DefaultOrderBy = null;
    }       
    
    search(searchText: string): Observable<any> {
        return this.Action(0, "s")
        
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('business-relations?action=search-data-hotel&searchText=' + searchText)
            .send();
    }
}