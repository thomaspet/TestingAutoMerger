import {Component, Output, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, EventEmitter} from '@angular/core';
import {ErrorService, SupplierInvoiceService, UserService} from '../../../../services/services';
import {User, Team, Task, SupplierInvoice, ApprovalStatus, Approval} from '../../../../unientities';
import {billViewLanguage as lang, approvalStatusLabels as statusLabels} from './lang';

// tslint:disable:max-line-length

@Component({
    selector: 'uni-approve-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>                
                <article class="modal-content" [attr.aria-busy]="busy" >
                    
                    <h3>{{currentTask?.Title}}</h3>
                    
                    <header class="regtime_filters no-print">
                        <ul>
                            <li>
                                <a (click)="switchTab(0)" [ngClass]="{'router-link-active': !rejectTab}">
                                    Godkjenning
                                </a>
                            </li>
                            <li>
                                <a (click)="switchTab(1)" [ngClass]="{'router-link-active': rejectTab}">
                                    Avvis
                                </a>
                            </li>
                        </ul>
                    </header>    

                    <section class="tab-page">

                        <article [hidden]="rejectTab">     
                            <strong>Status:</strong>
                            <table>
                                <tr *ngFor="let approval of currentTask?.Approvals">
                                    <td>{{approval.userName}}</td>
                                    <td>{{approval.statusLabel}}</td>
                                </tr>
                            </table>
                        </article>
                        
                        <article [hidden]="!rejectTab">
                            Avvis med kommentar:
                            <textarea [(ngModel)]="rejectMessage"></textarea>
                        </article>

                    </section>

                    <footer>                         
                        <button [disabled]="!canApprove" (click)="onCloseAction('ok')" class="good">{{okButtonLabel}}</button>
                        <button (click)="onCloseAction('cancel')" class="bad">Avbryt</button>
                    </footer>

                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush    
})
export class UniApproveModal {

    private isOpen: boolean = false;
    private busy: boolean = false;
    private rejectTab: boolean = false;
    private teams: Array<Team>;
    private users: Array<User>;
    private currentTeam: Team;
    private currentUser: User;
    private okButtonLabel: string = lang.task_approve;
    private invoice: SupplierInvoice;
    private get currentTask(): Task {
        return <any>(this.invoice ? this.invoice['_task'] : undefined);
    }
    private rejectMessage: string = '';
    private canApprove: boolean = false;
    private myApproval: Approval;
    private myUser: User;

    @Output() public okclicked: EventEmitter<ApprovalDetails> = new EventEmitter();

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService,
        private userService: UserService) {
            userService.getCurrentUser().subscribe( usr => {
                this.myUser = usr;
            });
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
            prom.then( () => this.okclicked.emit( this.currentDetails) );                        
            return;
        } 
        
        this.isOpen = false;
        this.onClose(false);
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
            var msg = `${this.rejectMessage} : ${this.myUser.DisplayName}`;
            this.supplierInvoiceService.send(`comments/supplierinvoice/${this.invoice.ID}`, undefined, 'POST', { Text: msg })
                .subscribe( commentResult => {} );
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

    public open(invoice: SupplierInvoice, forApproval: boolean = true): Promise<boolean> {

        this.invoice = invoice;
        this.canApprove = false;
        this.okButtonLabel = forApproval ? lang.task_approve : lang.task_reject;
        this.rejectTab = !forApproval;

        if (this.currentTask) {
            let approvals = this.currentTask.Approvals;
            if (approvals) {
                approvals.forEach( x => {
                    x['statusLabel'] = statusLabels[x.StatusCode];
                    if (x.UserID === this.myUser.ID && x.StatusCode === ApprovalStatus.Active) {
                        this.myApproval = x;
                        this.canApprove = true;
                    }
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

        this.isOpen = true;
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
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
}
