import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PostPost} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class PostPostService extends BizHttp<PostPost> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PostPost.RelativeUrl;
        this.entityType = PostPost.EntityType;
        this.DefaultOrderBy = null;
    }


    public markPosts(journalEntryLineCouples: Array<any>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineCouples)
            .withEndPoint(this.relativeURL + '?action=markposts')
            .send()
            .map(response => response.json());
    }

    public revertPostpostMarking(journalEntryLineIDs: Array<number>): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(journalEntryLineIDs)
            .withEndPoint(this.relativeURL + '?action=revert-postpost')
            .send()
            .map(response => response.json());
    }
}
