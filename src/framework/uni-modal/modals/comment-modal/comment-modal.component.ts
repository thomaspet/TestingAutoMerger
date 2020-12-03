import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, ConfirmActions, IUniModal} from '@uni-framework/uni-modal/interfaces';

export interface ICommentModalResult {
    action: ConfirmActions;
    comment: string;
}

@Component({
    selector: 'comment-modal-component',
    styleUrls: ['./comment-modal.component.sass'],
    templateUrl: './comment-modal.component.html'
})
export class CommentModalComponent  implements IUniModal {
    options: IModalOptions;
    onClose = new EventEmitter<ICommentModalResult>();
    comment: string = null;
    initialComment: string = null;
    ngOnInit() {
        this.comment = this.initialComment = this.options.data.comment;
    }
    accept() {
        this.onClose.emit({
            action: ConfirmActions.ACCEPT,
            comment : this.comment
        });
    }
    cancel() {
        this.onClose.emit({
            action: ConfirmActions.CANCEL,
            comment: this.initialComment
        });
    }
}
