import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {BusinessRelation} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {RequestMethod} from '@angular/http';

@Injectable()
export class BusinessRelationService extends BizHttp<BusinessRelation> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BusinessRelation.RelativeUrl;
        this.entityType = BusinessRelation.EntityType;
        this.DefaultOrderBy = null;
    }

    public search(searchText: string): Observable<any> {
        return this.Action(null, 'search-data-hotel', 'searchText=' + searchText, RequestMethod.Get);
    }
}
