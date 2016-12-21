import {Injectable} from '@angular/core';
import {UniHttp} from '../core/http/http';
import {Comment} from '../../app/unientities';

@Injectable()
export class CommentService {

    constructor(protected http: UniHttp) {}

    public getAll(entity: string, entityID: number) {
        const route = `comments?filter=entitytype eq '${entity}' and entityid eq ${entityID}`;
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(`${route}&expand=Author`)
            .send()
            .map((res) => {
                let comments = res.json();
                return comments.map((comment: Comment) => {
                    comment.Text = decodeURI(comment.Text);
                    return comment;
                });
            });
    }

    public post(entity: string, entityID: number, message: string) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${Comment.RelativeUrl}/${entity}/${entityID}`)
            .withBody({Text: message})
            .send()
            .map(res => res.json());
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
            .map(res => res.json());
    }

    public delete(comment: Comment) {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`${Comment.RelativeUrl}/${comment.ID}`)
            .send();
    }

}
