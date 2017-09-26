import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Approval, ApprovalStatus, User} from '../../../unientities';
import {ApprovalService, UserService, ErrorService} from '../../../services/services';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniApproveModal} from '../../accounting/bill/detail/approvemodal';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {CommentService} from '../../../../framework/comments/commentService';
import * as moment from 'moment';

@Component({
    selector: 'uni-approvals',
    templateUrl: './approvals.html'
})
export class UniApprovals {
    @ViewChild('approvalList')
    private approvalList: ElementRef;

    private routeParam: number;
    private approvals: Approval[];
    private selectedApproval: Approval;
    private currentUser: User;
    private users: User[];

    private showCompleted: boolean;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private approvalService: ApprovalService,
        private userService: UserService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private commentService: CommentService
    ) {
        route.params.subscribe((params) => {
            this.routeParam = +params['id'];
        });
    }

    public get entityType(): string {
        if (!(this.selectedApproval && this.selectedApproval.Task)) {
            return '';
        }
        switch (this.selectedApproval.Task.ModelID) {
            case 196:
                return 'WorkItemGroup';
            case 162:
                return 'SupplierInvoice';
        }
    }

    public get entityID(): number {
        if (!(this.selectedApproval && this.selectedApproval.Task)) {
            return 0;
        }
        return this.selectedApproval.Task.EntityID;
    }

    public get title(): string {
        if (!(this.selectedApproval && this.selectedApproval.Task && this.selectedApproval.Task.Title)) {
            return '';
        }
        var title = this.selectedApproval.Task.Title;
        return title;
    }

    public ngOnInit() {
        this.tabService.addTab({
            name: 'Godkjenninger',
            url: '/assignments/approvals',
            moduleID: UniModules.Assignments,
            active: true
        });

        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.userService.GetAll(null)
        ).subscribe(
            res => {
                this.currentUser = res[0];
                this.users = res[1];
                this.loadApprovals();
            },
            err => this.errorService.handle(err)
        );
    }

    private loadApprovals(): void {
        this.approvalService.invalidateCache();
        let filterString = 'filter=UserID eq ' + this.currentUser.ID;
        if (!this.showCompleted) {
            filterString += ' and StatusCode eq ' + ApprovalStatus.Active;
        }

        this.approvalService.GetAll(filterString, ['Task.Model']).subscribe(
            approvals => {
                this.approvals = approvals.map(a => this.addApprovalMetadata(a));

                let selectedIndex = this.approvals.findIndex(a => a.ID === this.routeParam);
                if (selectedIndex < 0) {
                    selectedIndex = this.approvals.length - 1;
                }

                this.selectedApproval = this.approvals[selectedIndex];
                this.scrollToListItem(selectedIndex);
            },
            err => this.errorService.handle(err)
        );
    }

    private addApprovalMetadata(approval: Approval): Approval {
        let assignedBy = this.users.find(u => u.GlobalIdentity === approval.CreatedBy);
        if (assignedBy) {
            approval['_assignedBy'] = assignedBy.DisplayName;
        }

        if (approval.CreatedAt) {
            approval['_createdDate'] = moment(approval.CreatedAt).format('DD. MMM YYYY');
        }

        if (approval.StatusCode === ApprovalStatus.Active) {
            approval['_activeApproval'] = true;
        }

        return approval;
    }

    public approveOrReject(approval: Approval, isApprove: boolean): void {
        let invoice = {
            ID: approval.Task.EntityID,
            _task: approval.Task
        };
        invoice._task.Approvals = [approval];
        this.modalService.open(UniApproveModal,
            {
                data: {
                    invoice: invoice,
                    forApproval: isApprove
                }
            }).onClose.subscribe((res: any) => {
                if (res && res.message) {
                    this.addComment(approval.Task.Model.Name, approval.Task.EntityID, res.message);
                }
                this.loadApprovals();

        }, err => this.errorService.handle(err));
    }

    public toggleShowCompleted() {
        this.showCompleted = !this.showCompleted;
        this.loadApprovals();
    }

    private scrollToListItem(index: number): void {
        setTimeout(() => {
            const list = this.approvalList.nativeElement || {children: []};
            const listItem = list.children[index];
            if (!listItem) {
                return;
            }

            const bottom = list.scrollTop + list.offsetHeight - listItem.offsetHeight;

            if (listItem.offsetTop <= list.scrollTop) {
                list.scrollTop = listItem.offsetTop;
            } else if (listItem.offsetTop >= bottom) {
                list.scrollTop = listItem.offsetTop - (list.offsetHeight - listItem.offsetHeight);
            }
        });
    }

    private addComment(type: string, ID: number, comment: string) {
        this.commentService.post(type, ID, comment)
        .subscribe(() => { });
    }
}
