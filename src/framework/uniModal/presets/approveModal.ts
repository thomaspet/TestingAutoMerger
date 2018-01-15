import {Component, Output, Input, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, EventEmitter} from '@angular/core';
import {ErrorService, SupplierInvoiceService, UserService} from '../../../app/services/services';
import {
    User,
    Team,
    Task,
    SupplierInvoice,
    ApprovalStatus,
    Approval,
    UserRole
} from '../../../app/unientities';
import {
    billViewLanguage as lang,
    approvalStatusLabels as statusLabels}
from '../../../app/components/accounting/bill/detail/lang';
import { IModalOptions, IUniModal } from '@uni-framework/uniModal/interfaces';

// tslint:disable:max-line-length

@Component({
    selector: 'uni-approve-modal',
    template: `
        <section role="dialog" class="uni-modal uni-approve-modal-class">

            <header>
                <h1 style="width: 50%">
                    {{ modalTitle }}
                </h1>
            </header>

            <article [attr.aria-busy]="busy">
                <ul class="approveModalAssignRejectUl">
                    <li (click)="switchTab(0)" [ngClass]="{'selected_tab_view': !rejectTab}">
                        Godkjenning
                    </li>
                    <li (click)="switchTab(1)" [ngClass]="{'selected_tab_view': rejectTab}">
                        Avvis
                    </li>
                    <div style="clear: both"></div>
                </ul>

                <section class="tab-page">

                    <article [hidden]="rejectTab">
                        <strong>Status:</strong>
                        <table>
                            <tr *ngFor="let approval of currentTask?.Approvals">
                                <td>{{approval.userName}}</td>
                                <td>{{approval.statusLabel}}</td>
                            </tr>
                        </table>
                        <textarea [(ngModel)]="comment" placeholder="Kommentar" style="margin-top: 20px"></textarea>
                    </article>

                    <article [hidden]="!rejectTab">
                        <textarea [(ngModel)]="comment" placeholder="Kommentar"></textarea>
                    </article>

                </section>
            </article>
            <footer>
                <button [disabled]="(!canApprove && !this.rejectTab) || (!canReject && this.rejectTab)" (click)="onCloseAction('ok')" class="good">{{okButtonLabel}}</button>
                <button (click)="onCloseAction('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniApproveModal implements IUniModal {

    private isOpen: boolean = false;
    private busy: boolean = false;
    private rejectTab: boolean = false;
    private teams: Array<Team>;
    private users: Array<User>;
    private currentTeam: Team;
    private currentUser: User;
    private okButtonLabel: string = lang.task_approve;
    private modalTitle: string = '';
    private invoice: SupplierInvoice;
    private get currentTask(): Task {
        return <any>(this.invoice ? this.invoice['_task'] : undefined);
    }
    private canApprove: boolean = false;
    private canReject: boolean = false;
    private myApproval: Approval;
    private myUser: User;
    public comment: string = '';

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<ApprovalDetails> = new EventEmitter();

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService,
        private userService: UserService) {
            userService.getCurrentUser().subscribe( usr => {
                this.myUser = usr;
            });
    }

    public ngOnInit() {
        if (!this.options || !this.options.data) {
            return;
        }
        this.invoice = this.options.data.invoice;
        this.okButtonLabel = this.options.data.forApproval ? lang.task_approve : lang.task_reject;
        this.modalTitle = this.options.data.forApproval ? lang.task_approve : lang.task_reject;
        this.rejectTab = !this.options.data.forApproval;

        if (this.currentTask) {
            let approvals = this.currentTask.Approvals;
            if (approvals) {
                this.userService.getRolesByUserId(this.myUser.ID).subscribe((roles: UserRole[]) => {
                    let isAdmin = false;
                    if (roles.find(x => x.SharedRoleName === 'Administrator' || x.SharedRoleName === 'Accounting.Admin')) {
                        isAdmin = true;
                    }

                    if (this.currentTask.UserID === this.myUser.ID || isAdmin) {
                        let approval: Approval = approvals.find(x => x.StatusCode === ApprovalStatus.Active);
                        if (approval) {
                            this.myApproval = approval;
                            this.canReject = true;
                            this.canApprove = true;
                        }
                    } else {
                        let approval: Approval = approvals.find(x => x.UserID === this.myUser.ID && x.StatusCode === ApprovalStatus.Active);
                        if (approval) {
                            this.myApproval = approval;
                            this.canApprove = true;
                        }
                    }

                    approvals.forEach( x => {
                        x['statusLabel'] = statusLabels[x.StatusCode];
                    });
                });
            }
        }

        this.goBusy(true);
        this.supplierInvoiceService.getTeamsAndUsers().subscribe( x => {

            this.teams = x.teams;
            this.users = x.users;

            this.sorByProp(this.users, 'DisplayName');
            this.currentUser = this.users && this.users.length > 0 ? this.users[0] : undefined;

            // Extract-displaynames from users and inject into teams
            if (this.teams) {
                this.teams.forEach( t => {
                    let names = '';
                    if (t.Positions) {
                        t.Positions.forEach( p => {
                            let user = this.users.find( u => u.ID === p.UserID);
                            if (user) {
                                p['User'] = user;
                                names += ( names ? ', ' : '' ) + user.DisplayName;
                            }
                        });
                    }
                    t['Names'] = names;
                });
                this.currentTeam = this.teams.length > 0 ? this.teams[0] : new Team();
            }

            // Copy usernames into approvals
            if (this.currentTask) {
                let approvals = this.currentTask.Approvals;
                if (approvals) {
                    approvals.forEach( a => {
                        let user = this.users.find( u => u.ID === a.UserID );
                        if (user) {
                            a['userName'] = user.DisplayName;
                        }
                    });
                }
            }

            this.goBusy(false);

        });
    }

    public switchTab(index: number) {
        this.rejectTab = index === 1;
        this.okButtonLabel = this.rejectTab ? lang.task_reject : lang.task_approve;
        this.modalTitle = this.rejectTab ? lang.task_reject : lang.task_approve;
    }

    public get currentDetails(): ApprovalDetails {
        var details = new ApprovalDetails();
        if (this.rejectTab) {
            details.rejected = true;
        } else {
            details.approved = true;
        }
        details.message = this.comment;

        return details;
    }

    private onCloseAction(src: 'ok' | 'cancel') {

        if (src === 'ok') {

            if (this.rejectTab && !this.comment) {
                this.errorService.addErrorToast(lang.err_missing_comment);
                return;
            }

            var prom: Promise<boolean> = (this.rejectTab) ? this.reject() : this.approve();
            prom.then( () => this.onClose.emit( this.currentDetails) );
            return;
        }

        this.isOpen = false;
        this.onClose.emit(null);
        this.refresh();
    }

    private approve(): Promise<boolean> {
        this.goBusy(true);
        return new Promise<boolean>( (resolve, reject) => {
            this.supplierInvoiceService.send(`approvals/${this.myApproval.ID}?action=approve`)
                .finally( () => this.goBusy(false) )
                .subscribe( result => {
                    resolve(true);
                    },
                    err => this.errorService.handle(err)
                );
        });
    }

    private reject(): Promise<boolean> {
        this.goBusy(true);
        return new Promise<boolean>( (resolve, reject) => {
            this.supplierInvoiceService.send(`approvals/${this.myApproval.ID}?action=reject`)
                .finally( () => this.goBusy(false) )
                .subscribe( result => {
                    resolve(true);
                    },
                    err => this.errorService.handle(err)
                );
        });
    }

    public goBusy(busy: boolean = true) {
        this.busy = busy;
        this.refresh();
    }

    public close() {
        this.goBusy(false);
        this.isOpen = false;
        this.onClose.emit(null);
        this.refresh();
    }

    @HostListener('keydown', ['$event'])
    public keyHandler(event: KeyboardEvent) {
        if (!this.isOpen) { return; }
        switch (event.keyCode) {
            case 27: // ESC
                this.onCloseAction('cancel');
                break;
            case 83: // S
                if (event.ctrlKey) {
                    this.onCloseAction('ok');
                }
                break;
        }
    }

    private sorByProp(list: Array<any>, prop: string) {
        list.sort( (a, b) => a[prop].toLowerCase() < b[prop].toLowerCase() ? -1 :
                a[prop].toLowerCase() === b[prop].toLowerCase() ? 0 : 1 );
    }

    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

}

// tslint:disable:variable-name
export class ApprovalDetails {
    public taskCompleted: boolean;
    public approved: boolean;
    public rejected: boolean;
    public message?: string;
}
