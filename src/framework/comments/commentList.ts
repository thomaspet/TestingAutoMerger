import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {Comment} from '../../app/unientities';
import * as moment from 'moment';

@Component({
    selector: 'uni-comment-list',
    template: `
        <ol #commentList class="comment-list">
            <li *ngFor="let comment of comments">
                <uni-avatar [name]="comment.Author?.DisplayName"></uni-avatar>
                <main>
                    <header>
                        <strong>{{comment.Author?.DisplayName}}</strong>
                        <small>{{getTimeFromNow(comment.CreatedAt)}}</small>
                    </header>
                    <blockquote [innerHTML]="comment.Text"></blockquote>
                </main>
            </li>
        </ol>
    `
})
export class UniCommentList {
    @ViewChild('commentList')
    private commentList: ElementRef;

    @Input()
    private comments: Comment[];

    private commentsWithMentions: Comment[];

    public ngOnChanges() {
        if (this.comments) {
            this.commentsWithMentions = this.comments.map((comment) => {
                let words = comment.Text && comment.Text.split(' ');
                words = words.map((word) => {
                    return word.startsWith('@')
                        ? `<span class="mention">${word}</span>`
                        : word;
                });

                comment.Text = words.join(' ');
                return comment;
            });

            // Scroll to bottom
            setTimeout(() => {
                const list = this.commentList && this.commentList.nativeElement;
                if (list) {
                    list.scrollTop = list.scrollHeight;
                }
            });
        }
    }

    public getTimeFromNow(createdAt: Date): string {
        return (createdAt)
            ? moment(createdAt).fromNow()
            : '';
    }
}
