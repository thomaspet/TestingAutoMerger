import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Comment} from '../../app/unientities';
import {CommentService} from './commentService';
import {ErrorService, UserService} from '../../app/services/services';

@Component({
    selector: 'uni-comments',
    templateUrl: './comments.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniComments {
    @Input()
    private entity: string;

    @Input()
    private entityID: number;

    private isOpen: boolean;
    private comments: Comment[] = [];

    constructor(
        private commentService: CommentService,
        private userService: UserService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnChanges() {
        if (this.entity && this.entityID) {
            this.getComments();
        }
    }

    public toggle(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.isOpen = !this.isOpen;
        this.cdr.markForCheck();
    }

    public close() {
        this.isOpen = false;
        this.cdr.markForCheck();
    }

    public submitComment(text: string) {
        this.commentService.post(
            this.entity,
            this.entityID,
            text
        ).subscribe(
            res => this.getComments(),
            err => this.errorService.handle(err)
        );
    }

    public getComments() {
        this.commentService.getAll(this.entity, this.entityID).subscribe(
            res => {
                this.comments = res;
                this.cdr.markForCheck();
            },
            err => this.errorService.handle(err)
        );
    }
}
