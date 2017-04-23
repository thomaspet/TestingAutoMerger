import {Component, Output, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, EventEmitter} from '@angular/core';
import {ErrorService, SupplierInvoiceService} from '../../../../services/services';
import {User, Team} from '../../../../unientities';

// tslint:disable:max-line-length

@Component({
    selector: 'uni-assign-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>                
                <article class="modal-content" [attr.aria-busy]="busy" >
                    
                    <h3>Tildel til:</h3>
                    
                    <header class="regtime_filters no-print">
                        <ul>
                            <li>
                                <a (click)="userTab=false" [ngClass]="{'router-link-active': !userTab}">
                                    Team
                                    <span class='tab_counter'>{{teams?.length}}</span>
                                </a>
                            </li>
                            <li>
                                <a (click)="userTab=true" [ngClass]="{'router-link-active': userTab}">
                                    Brukere
                                    <span class='tab_counter'>{{users?.length}}</span>
                                </a>
                            </li>
                        </ul>
                    </header>    

                    <section class="tab-page">

                        <article [hidden]="userTab">     
                            Velg team:                       
                            <select [(ngModel)]="currentTeam">
                                <option [ngValue]="team" *ngFor="let team of teams">{{team.Name}}</option></select>
                            <span class="members">{{currentTeam?.Names}}</span>
                        </article>
                        
                        <article [hidden]="!userTab">
                            Velg bruker:
                            <select [(ngModel)]="currentUser">
                                <option [ngValue]="user" *ngFor="let user of users">{{user.DisplayName}} ({{user.Email}})</option>
                            </select>
                            <span class="members">Brukerid: {{currentUser?.ID}}</span>
                        </article>

                    </section>

                    <footer>                         
                        <button (click)="onCloseAction('ok')" class="good">Tildel</button>
                        <button (click)="onCloseAction('cancel')" class="bad">Avbryt</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush    
})
export class UniAssignModal {

    private isOpen: boolean = false;
    private busy: boolean = false;
    private userTab: boolean = false;
    private teams: Array<Team>;
    private users: Array<User>;
    private currentTeam: Team;
    private currentUser: User;

    @Output() public okclicked: EventEmitter<AssignDetails> = new EventEmitter();

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public get selectedUsers(): Array<User> {
        var list: Array<User> = [];

        if (this.userTab) {
            list.push(this.currentUser);
        } else {
            if (this.currentTeam && this.currentTeam.Positions) {
                this.currentTeam.Positions.forEach( x => list.push(x['User']));
            }
        }
        return list;
    }

    public get currentDetails(): AssignDetails {
        var details = new AssignDetails();
        if (this.userTab) {
            details.Message = '';
            details.UserIDs = [this.currentUser.ID];
            details.TeamIDs = [];
        } else {
            details.Message = '';
            details.UserIDs = [];
            details.TeamIDs = [this.currentTeam.ID];
        }
        return details;        
    }

    private onCloseAction(src: 'ok' | 'cancel') {
       
        if (src === 'ok') {
            if (this.selectedUsers.length === 0) { return; }
            this.goBusy();
            this.okclicked.emit(this.currentDetails);            
            return;
        } 
        this.isOpen = false;
        this.onClose(false);
        this.refresh();
    }
    
    private goBusy(busy: boolean = true) {
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

    public open(): Promise<boolean> {

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
export class AssignDetails {
    public Message: string;
    public TeamIDs: Array<number>;
    public UserIDs: Array<number>;
}
