import {Component, Input} from '@angular/core';
import {ErrorService} from '../../../services/services';
import {CommentService} from '../../../../framework/comments/commentService';

@Component({
    selector: 'task-details',
    templateUrl: './taskDetails.html'
})
export class TaskDetails {
    @Input()
    public selectedTask: any;

    private comments: Comment[];

    constructor(
        private errorService: ErrorService,
        private commentService: CommentService
    ) {}

    public ngOnChanges() {
        if (this.selectedTask && this.selectedTask.ID) {
            this.getComments();
        }
    }

    private getComments() {
        this.commentService.getAll('Task', this.selectedTask.ID)
            .subscribe(
                res => this.comments = res,
                err => this.errorService.handle(err)
            );
    }

    public submitComment(text: string) {
        this.commentService.post('Task', this.selectedTask.ID, text)
            .subscribe(
                res => this.getComments(),
                err => this.errorService.handle(err)
            );
    }

}
