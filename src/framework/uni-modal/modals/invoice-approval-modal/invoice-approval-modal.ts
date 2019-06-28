import {Component, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import {uniqBy} from 'lodash';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {User, Task, Approval, TaskApprovalPlan, ApprovalStatus, ApprovalSubstitute} from '@app/unientities';
import {CommentService} from '@uni-framework/comments/commentService';
import {
    UserService,
    ErrorService,
    ApprovalService,
    SupplierInvoiceService,
    ApprovalSubstituteService
} from '@app/services/services';

@Component({
    selector: 'invoice-approval-modal',
    templateUrl: './invoice-approval-modal.html',
    styleUrls: ['./invoice-approval-modal.sass']
})
export class InvoiceApprovalModal implements IUniModal {
    options: IModalOptions = {};
    onClose = new EventEmitter<boolean>();

    busy: boolean;
    canApprove: boolean;
    approvalStatus = ApprovalStatus; // for use in template

    action: 'approve' | 'reject';
    users: User[];
    entityID: number;
    entityType: string;
    task: Task;

    comment: string;
    commentMissing: boolean;

    approvals: (Approval | TaskApprovalPlan)[];
    currentUsersApproval: Approval;

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private approvalService: ApprovalService,
        private commentService: CommentService,
        private substituteService: ApprovalSubstituteService,
        private invoiceService: SupplierInvoiceService,
    ) {}

    ngOnInit() {
        this.busy = true;
        const data = this.options.data || {};
        this.action = data.action;
        this.task = data.task;
        this.entityType = data.entityType;

        this.entityID = this.task.EntityID;

        const requests = [
            this.userService.getCurrentUser(),
            this.userService.getActiveUsers(),
            this.substituteService.getActiveSubstitutes()
        ];

        if (this.entityType === 'SupplierInvoice' && this.entityID) {
            requests.push(this.invoiceService.Get(this.entityID));
        }

        forkJoin(requests).subscribe(
            (res: any[]) => {
                this.busy = false;
                const currentUser = res[0];
                this.users = res[1];

                const substitutes: ApprovalSubstitute[] = res[2] || [];
                const invoice = res[3];

                if (this.task) {
                    const approvals = this.task.Approvals || [];
                    const approvalPlan = (this.task.ApprovalPlan || [])
                        .filter(plan => invoice && invoice.TaxInclusiveAmount >= plan.Limit);

                    // Merge approvals and approvalPlan, remove duplicates (by UserID)
                    const merged = uniqBy([...approvals, ...approvalPlan], item => item.UserID);

                    this.approvals = merged.map(approval => {
                        const user = this.users.find(u => u.ID === approval.UserID);
                        approval['_user'] = user ? user.DisplayName || user.Email : 'Ukjent bruker';
                        return approval;
                    });

                    const substituteFor = substitutes
                        .filter(sub => sub.SubstituteUserID === currentUser.ID)
                        .map(sub => sub.UserID);

                    this.currentUsersApproval = approvals.find(a => {
                        if (a.StatusCode !== ApprovalStatus.Active) {
                            return false;
                        }

                        return a.UserID === currentUser.ID || substituteFor.some(id => id === a.UserID);
                    });
                }

            },
            err => {
                this.errorService.handle(err);
                this.onClose.emit();
            }
        );
    }

    submit() {
        this.commentMissing = this.action === 'reject' && !this.comment;
        if (!this.commentMissing && this.currentUsersApproval) {
            this.busy = true;

            this.approvalService.PostAction(this.currentUsersApproval.ID, this.action).subscribe(
                () => {
                    if (this.comment) {
                        this.commentService.post(this.entityType, this.entityID, this.comment).subscribe(
                            () => {
                                this.commentService.loadComments(this.entityType, this.entityID);
                                this.onClose.emit(true);
                            },
                            () => this.onClose.emit(true)
                        );
                    } else {
                        this.onClose.emit(true);
                    }
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }
}
