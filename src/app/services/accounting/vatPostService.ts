import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatPost, LocalDate} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
@Injectable()
export class VatPostService extends BizHttp<VatPost> {

    constructor(http: UniHttp) {
        super(http);

        // TODO: should resolve this from configuration based on type
        this.relativeURL = 'vatposts';
        this.entityType = VatPost.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public getAllPostsWithPercentage(localDate: LocalDate): Observable<VatPost[]> {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + '?action=get-vatposts-with-percentage&date=' + localDate)
        .send()
        .map(response => response.json());
    }


}
