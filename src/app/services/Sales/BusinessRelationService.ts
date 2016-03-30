import {BizHttp} from '../../../framework/core/http/BizHttp';
<<<<<<< HEAD
import {Customer, BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";
=======
import {BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4

export class BusinessRelationService extends BizHttp<BusinessRelation> {
    
    constructor(http: UniHttp) {        
<<<<<<< HEAD
        super(http);       
        this.relativeURL = "businessrelations"; // TODO: change to BusinessRelation.relativeUrl;
=======
        super(http);        
        this.relativeURL = BusinessRelation.relativeUrl;
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
        this.DefaultOrderBy = null;
    }       
    
    search(searchText: string): Observable<any> {
        return this.http
            .asGET()  
            .withEndPoint('business-relations?action=search-data-hotel&searchText=' + searchText)
            .send();
    }
}