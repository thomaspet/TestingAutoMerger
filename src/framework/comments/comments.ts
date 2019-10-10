import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Comment} from '../../app/unientities';
import {CommentService} from './commentService';
import {ErrorService} from '../../app/services/services';
import { ChatBoxService } from '@app/components/layout/chat-box/chat-box.service';
import { BusinessObject } from '@app/models';
import { SignalRService } from '@app/services/common/signal-r.service';

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

    @Input()
    public toggleMode: boolean;

    public isOpen: boolean;
    public comments: Comment[] = [];

    constructor(
        private chatBoxService: ChatBoxService,
        private commentService: CommentService,
        private errorService: ErrorService,
        private signalRService: SignalRService,
        private cdr: ChangeDetectorRef
    ) {
        this.commentService.comments$.subscribe(comments => {
            this.comments = comments;
            this.cdr.markForCheck();
        });
    }

    public ngOnChanges() {
        if (this.entity && this.entityID) {
            // Loading into ReplaySubject in commentService and reading from the subject
            // Allows the list to be updated with new comments without triggering a manual refresh here
            this.commentService.loadComments(this.entity, this.entityID);
        }
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

    openChatBox() {
        const businessObject: BusinessObject = {
            EntityID: this.entityID,
            EntityType: this.entity,
            CompanyKey: this.signalRService.currentCompanyKey,
        };
        const businessObjectExists = this.chatBoxService.businessObjects
            .getValue()
            .find(bo => bo.EntityID === businessObject.EntityID && bo.EntityType.toLowerCase() === businessObject.EntityType.toLowerCase());

        if (!businessObjectExists) {
            this.chatBoxService.businessObjects.next([businessObject].concat(this.chatBoxService.businessObjects.getValue())
            );
        }
    }
}
