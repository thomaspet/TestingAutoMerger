import {Component, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener} from '@angular/core';
import {ErrorService, UserService} from '../../../../services/services';
import {User, ApprovalStatus, Approval} from '../../../../unientities';
import {UniHttp} from '../../../../../framework/core/http/http';

// tslint:disable:max-line-length

const lang = {
    task_approve: 'Godkjenn',
    task_reject: 'Avvis',
    cancel: 'Lukk',
    err_missing_comment: 'Vennligst legg inn en kommentar',
    section_approval: 'Godkjenning',
    section_reject: 'Avvis',
    msg_reject_with_comment: 'Avvis med kommentar:',
    status: 'Status'
};

const approvalStatusLabels = {
    50120: 'Tildelt',
    50130: 'Godkjent',
    50140: 'Avvist'
};

@Component({
    selector: 'uni-approvetask-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <article class="modal-content" [attr.aria-busy]="busy" >
                    
                    <h3>{{currentTask?.Title}}</h3>
                    
                    <header class="regtime_filters no-print">
                        <ul>
                            <li>
                                <a (click)="switchTab(0)" [ngClass]="{'router-link-active': !rejectTab}">
                                {{labels.section_approval}}
                                </a>
                            </li>
                            <li>
                                <a (click)="switchTab(1)" [ngClass]="{'router-link-active': rejectTab}">
                                {{labels.section_reject}}
                                </a>
                            </li>
                        </ul>
                    </header>    

                    <section class="tab-page">

                        <article [hidden]="rejectTab">     
                            <strong>{{labels.status}}:</strong>
                            <table>
                                <tr *ngFor="let approval of approvals">
                                    <td>{{approval.User.DisplayName}}</td>
                                    <td>{{approval.statusLabel}}</td>
                                </tr>
                            </table>
                        </article>
                        
                        <article [hidden]="!rejectTab">
                            {{labels.msg_reject_with_comment}}
                            <textarea [(ngModel)]="rejectMessage"></textarea>
                        </article>

                    </section>

                    <footer>                         
                        <button [disabled]="!canApprove" (click)="onCloseAction('ok')" class="good">{{okButtonLabel}}</button>
                        <button (click)="onCloseAction('cancel')" class="bad">{{labels.cancel}}</button>
                    </footer>

                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush    
})
export class UniApproveTaskModal {

    private isOpen: boolean = false;
    private busy: boolean = false;
    private rejectTab: boolean = false;

    private modelName: string;
    private entityId: number;
    private taskID: number; 
    private approvals: Array<Approval>;

    private rejectMessage: string = '';
    private canApprove: boolean = false;
    private myApproval: Approval;
    private myUser: User;
    public labels: any = lang;
    public okButtonLabel: string = lang.task_approve;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService,
        private userService: UserService,
        private http: UniHttp) {
            userService.getCurrentUser()
                .subscribe(usr => this.myUser = usr);
    }

    public switchTab(index: number) {
        this.rejectTab = index === 1;
        this.okButtonLabel = this.rejectTab ? lang.task_reject : lang.task_approve;
    }

    public get currentDetails(): ApprovalDetails {
        var details = new ApprovalDetails();
        if (this.rejectTab) {
            details.rejected = true;
        } else {
            details.approved = true;
        }
        return details;        
    }

    private onCloseAction(src: 'ok' | 'cancel') {
        
        if (src === 'ok') {

            if (this.rejectTab && !this.rejectMessage) {
                this.errorService.addErrorToast(lang.err_missing_comment);
                return;
            }

            var prom: Promise<boolean> = (this.rejectTab) ? this.reject() : this.approve();
            prom.then( result => { if (result) { this.closeAndHide(true); } } );                        
            return;
        } 
        
        this.closeAndHide(false);
    }    

    private closeAndHide(result: boolean) {
        this.isOpen = false;
        this.onClose(result);
        this.refresh();        
    }

    private approve(): Promise<boolean> {
        this.goBusy(true);
        return new Promise<boolean>( (resolve, reject) => {
            this.post(`approvals/${this.myApproval.ID}?action=approve`)
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
            var msg = `${this.rejectMessage} : ${this.myUser.DisplayName}`;
            this.post(`comments/${this.modelName}/${this.entityId}`, undefined, { Text: msg })
                .subscribe( commentResult => {} );
            this.post(`approvals/${this.myApproval.ID}?action=reject`)
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
        this.onClose(true);
        this.refresh();
    }

    private onClose: (ok: boolean) => void = () => {};

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

    public open(taskID: number, entityId: number, modelName: string, forApproval: boolean = true): Promise<boolean> {

        this.approvals = [];
        this.taskID = taskID;
        this.entityId = entityId;
        this.modelName = modelName;
        this.canApprove = false;
        this.rejectMessage = '';
        this.okButtonLabel = forApproval ? lang.task_approve : lang.task_reject;
        this.rejectTab = !forApproval;

        if (this.taskID) {
            this.get('approvals?expand=user&filter=taskid eq ' + this.taskID)
            .subscribe( result => {
                result.forEach( x => {
                    x['statusLabel'] = approvalStatusLabels[x.StatusCode];
                    if (x.UserID === this.myUser.ID && x.StatusCode === ApprovalStatus.Active) {
                        this.myApproval = x;
                        this.canApprove = true;
                    }
                 });
                this.approvals = result;
                this.refresh();
            });
        }

        this.isOpen = true;
        this.refresh();
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }
    
    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

    // HTTP-wrappers:

    private post(route: string, params?: any, body?: any ) {
        if (body) {
            return this.http.asPOST().usingBusinessDomain().withBody(body)
            .withEndPoint(route).send(params)
            .map(response => response.json());
        } else {
            return this.http.asPOST().usingBusinessDomain()
            .withEndPoint(route).send(params)
            .map(response => response.json());
        }
    }

    private get(route: string, params?: any ) {
        return this.http.asGET().usingBusinessDomain()
        .withEndPoint(route).send(params)
        .map(response => response.json());
    }   

}

// tslint:disable:variable-name
export class ApprovalDetails {
    public taskCompleted: boolean;
    public approved: boolean;
    public rejected: boolean;
}
