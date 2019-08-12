import {Injectable} from '@angular/core';
import {UniHttp} from '../core/http/http';
import {Comment} from '../../app/unientities';
import {ReplaySubject} from 'rxjs';

@Injectable()
export class CommentService {
    public comments$: ReplaySubject<Comment[]> = new ReplaySubject(1);

    constructor(protected http: UniHttp) {
        this.comments$.next([]);
    }

    public getAll(entity: string, entityID: number) {
        const route = `comments?filter=entitytype eq '${entity}' and entityid eq ${entityID}`;
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`${route}&expand=Author`)
            .send()
            .map(res => res.body || []);
    }

    public loadComments(entity: string, entityID: number) {
        this.getAll(entity, entityID).subscribe((res) => {
            this.comments$.next(res);
        });
    }

    public post(entity: string, entityID: number, message: string) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${Comment.RelativeUrl}/${entity}/${entityID}`)
            .withBody({Text: message})
            .send()
            .map(res => res.body);
    }

    public put(comment: Comment) {
        return this.http.asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${Comment.RelativeUrl}/${comment.ID}`)
            .withBody({
                ID: comment.ID,
                Text: comment.Text
            })
            .send()
            .map(res => res.body);
    }

    public delete(comment: Comment) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`${Comment.RelativeUrl}/${comment.ID}`)
            .send();
    }

}
