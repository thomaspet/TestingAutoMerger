// angular
import {Component, Input} from '@angular/core';
import {ErrorService} from '../../../services/services';
import {CommentService} from '../../../../framework/comments/commentService';
import * as moment from 'moment';
@Component({
    selector: 'task-details',
    templateUrl: './taskDetails.html'
})
export class TaskDetails {
    @Input()
    public selectedTask: any;

    private comments: Comment[];
    private commentText: string = '';

    constructor(
        private errorService: ErrorService,
        private commentService: CommentService
    ) {}

    public ngOnChanges() {
        if (this.selectedTask && this.selectedTask.ID) {
            this.getComments();

        }
    }

    private getTimeFromNow(createdAt: Date): string {
        return (createdAt)
        ? moment(createdAt).fromNow()
        : '';
    }

    private getComments() {
        this.commentService.getAll('Task', this.selectedTask.ID)
            .subscribe(
                res => this.comments = res,
                err => this.errorService.handle(err)
            );
    }

    public addComment() {
        this.commentService.post('Task', this.selectedTask.ID, this.commentText)
            .subscribe(
                res => this.getComments(),
                err => this.errorService.handle(err)
            );

        this.commentText = '';
    }

}
