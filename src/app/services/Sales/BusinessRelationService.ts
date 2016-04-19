import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
import {RequestMethod} from "angular2/http";

export class BusinessRelationService extends BizHttp<BusinessRelation> {
    
    constructor(http: UniHttp) {        
        super(http);       
        this.relativeURL = BusinessRelation.relativeUrl;
        this.DefaultOrderBy = null;
    }       
    
    search(searchText: string): Observable<any> {
        return this.Action(null, "search-data-hotel", "searchText=" + searchText, RequestMethod.Get);
    }
}