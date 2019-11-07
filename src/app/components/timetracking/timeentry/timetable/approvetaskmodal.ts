import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    EventEmitter
} from '@angular/core';
import {Observable} from 'rxjs';
import {ErrorService, UserService} from '@app/services/services';
import {User, ApprovalStatus, Approval} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

const approvalStatusLabels = {
    50120: 'Tildelt',
    50130: 'Godkjent',
    50140: 'Avvist'
};

@Component({
    selector: 'uni-approvetask-modal',
    template: `
    <section role="dialog" class="uni-modal">
        <header>{{rejectMode ? 'Avvis' : 'Godkjenning'}}</header>

        <article>
            <strong>{{labels.status}}</strong>
            <table>
                <tr *ngFor="let approval of approvals">
                    <td>{{approval.User.DisplayName}}</td>
                    <td>{{approval.statusLabel}}</td>
                </tr>
            </table>

            <section *ngIf="rejectMode" style="margin-top: 2rem;">
                <strong>Årsak til avvising</strong>
                <textarea [(ngModel)]="rejectMessage"></textarea>
            </section>
        </article>

        <footer>
            <button *ngIf="!rejectMode" class="good" (click)="approve()">
                Godkjenn
            </button>

            <button *ngIf="rejectMode" class="bad" (click)="reject()" [disabled]="!rejectMessage">
                Avvis
            </button>

            <button class="warning" (click)="onClose.emit()">Avbryt</button>
        </footer>
    </section>
    `,
})
export class UniApproveTaskModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    rejectMessage: string = '';
    approvals: Approval[] = [];
    taskID: number;
    entityID: number;
    canApprove: boolean;
    busy: boolean;
    rejectMode: boolean;

    private modelName: string;
    private myApproval: Approval;

    public labels = {
        task_approve: 'Godkjenn',
        task_reject: 'Avvis',
        cancel: 'Lukk',
        err_missing_comment: 'Vennligst legg inn en kommentar',
        section_approval: 'Godkjenning',
        section_reject: 'Avvis',
        msg_reject_with_comment: 'Avvis med kommentar:',
        status: 'Status'
    };

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private http: UniHttp
    ) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.entityID = data.entityID;
        this.modelName = data.modelName;
        this.rejectMode = data.rejectMode;

        if (data.taskID) {
            Observable.forkJoin(
                this.userService.getCurrentUser(),
                this.getApprovals(data.taskID)
            ).subscribe(
                res => {
                    const currentUser = res[0];
                    const approvals = res[1];

                    this.approvals = approvals.map(approval => {
                        approval['statusLabel'] = approvalStatusLabels[approval.StatusCode];
                        if (approval.UserID === currentUser.ID) {
                            this.myApproval = approval;
                            this.canApprove = true;
                        }

                        return approval;
                    });
                },
                err => this.errorService.handle(err)
            );
        }
    }

    private getApprovals(taskID: number): Observable<Approval[]> {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('approvals?expand=user&filter=taskid eq ' + taskID)
            .send()
            .map(res => res.body);
    }

    approve() {
        if (!this.busy) {
            this.busy = true;
            this.post(`approvals/${this.myApproval.ID}?action=approve`).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.busy = false;
                    this.errorService.handle(err);
                }
            );
        }
    }

    reject() {
        if (!this.busy) {
            this.busy = true;

            if (this.rejectMessage) {
                const commentsBody = {Text: this.rejectMessage};

                Observable.forkJoin(
                    this.post(`comments/${this.modelName}/${this.entityID}`, commentsBody),
                    this.post(`approvals/${this.myApproval.ID}?action=reject`)
                ).subscribe(
                    () => this.onClose.emit(true),
                    err => {
                        this.busy = false;
                        this.errorService.handle(err);
                    }
                );
            }
        }
    }

    private post(route: string, body?: any ) {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint(route)
            .send()
            .map(res => res.body);
    }
}

// tslint:disable:variable-name
export class ApprovalDetails {
    public taskCompleted: boolean;
    public approved: boolean;
    public rejected: boolean;
}
