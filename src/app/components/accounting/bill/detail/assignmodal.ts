import {Component, Output, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, EventEmitter, Pipe, PipeTransform} from '@angular/core';
import {ErrorService, SupplierInvoiceService} from '../../../../services/services';
import {IUniModal} from '../../../../../framework/uniModal/barrel';
import {User, Team} from '../../../../unientities';


interface IAssignUser extends User {
    selected: boolean;
}

@Pipe({
    name: 'stringFilter',
    pure: true
})

export class MyStringFilterPipe implements PipeTransform {
    public transform (items: any[], filter: string, key: string): any {
        if (!items || !filter) {
            return items;
        }
        return items.filter(item => item[key].toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }
}

@Component({
    selector: 'uni-assign-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Tildeling</h1></header>
            <article>
                <article>
                    <a  (click)="hideShowUsers('assingTeamListID')"
                        class="multiselectADropdown">
                        {{ currentTeam?.Name || 'Velg team'}}
                    </a>
                    <ul id="assingTeamListID" class="multiselectListElement">
                        <li> <input type="text" [(ngModel)]="teamString"
                            style="height: 1.7rem; width: 75%"
                            placeholder="Søk etter team" />
                        </li>
                        <li *ngFor="let team of teams | stringFilter:teamString:'Name'; let i = index"
                        (click)="onTeamSelect(team)">
                            <label class="" for="{{ 'assignteam' + i }}">
                                {{team.Name}}
                            </label>
                        </li>
                    </ul>
                </article>

               <article>
                    <a  (click)="hideShowUsers('assingUserListID')"
                        class="multiselectADropdown">
                        Velg bruker {{ !currentSelectedUsers.length ? '' : '(' + currentSelectedUsers.length + ')' }}
                    </a>
                    <ul id="assingUserListID" class="multiselectListElement">
                        <li> <input type="text" [(ngModel)]="searchString"
                            style="height: 1.7rem; width: 75%"
                            placeholder="Søk etter person" />
                        </li>
                        <li *ngFor="let user of users | stringFilter:searchString:'DisplayName'; let i = index"
                        (click)="addRemoveUserToSelectedArray($event, user)">
                            <label class="" for="{{ 'assignUser' + i }}">
                                <input type="checkbox" [(ngModel)]="user.selected" id="{{ 'assignUser' + i }}" />
                                {{user.DisplayName}}
                            </label>
                        </li>
                    </ul>
                </article>
                <article class="selectedSection">
                    <ul class="selectedAssigneeUsersList">
                        <li *ngFor="let user of currentSelectedUsers"
                            title="Dobbelklikk for å fjerne valgt"
                            (dblclick)="addRemoveUserToSelectedArray($event, user)">

                            <span>{{user.DisplayName}}</span><br>
                            <span class="members">Brukerid: {{user.ID}}</span>
                        </li>
                        <div style="clear: both;"></div>
                    </ul>
                    <section *ngIf="currentTeam" class="currentTeamText"
                        (dblclick)="currentTeam = null;" title="Dobbelklikk for å fjerne valgt">
                        <p>Team: <strong>{{ currentTeam.Name }}</strong></p>
                        <p>{{ currentTeam?.Names }}</p>
                    </section>
                </article>
                <textarea [(ngModel)]="comment" placeholder="Kommentar"></textarea>
            </article>
            <footer>
                <button (click)="onCloseAction('ok')"
                    class="good"
                    [disabled]="!currentSelectedUsers.length && !this.currentTeam">Tildel
                </button>
                <button (click)="onCloseAction('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
        `,
        providers: [MyStringFilterPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniAssignModal implements IUniModal {
    private isOpen: boolean = false;
    private busy: boolean = false;
    private teams: Array<Team>;
    private users: Array<any>;
    private currentTeam: Team;
    private currentUser: IAssignUser;
    private currentSelectedUsers: Array<any> = [];
    public userListIsShown: boolean = false;
    public searchString: string = '';
    public teamString: string = '';
    public comment: string = '';
    private cleanupHandler: () => void;

    @Output() public okclicked: EventEmitter<AssignDetails> = new EventEmitter();

    @Output()
    public onClose: EventEmitter<AssignDetails> = new EventEmitter();

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public ngOnInit() {
        this.goBusy(true);
        this.supplierInvoiceService.getTeamsAndUsers().subscribe( x => {

            this.teams = x.teams;
            this.users = x.users;

            this.users.forEach(user => user.selected = false );

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
            }

            this.goBusy(false);
        });
    }

    public get selectedUsers(): Array<User> {
        var list: Array<User> = [];

        if (this.currentSelectedUsers.length > 0) {
            return this.currentSelectedUsers;
        } else {
            if (this.currentTeam && this.currentTeam.Positions) {
                this.currentTeam.Positions.forEach( x => list.push(x['User']));
            }
        }
        return list;
    }

    public get currentDetails(): AssignDetails {
        var details = new AssignDetails();
        details.Message = this.comment;
        details.UserIDs = this.currentSelectedUsers.map(item => item.ID);
        details.TeamIDs = [];

        if (this.currentTeam) {
            details.UserIDs = [];
            details.TeamIDs = [this.currentTeam.ID];
        }
        return details;
    }

    public onTeamSelect(team: Team) {
        this.currentTeam = team;
        // Hide meny onselect like a normal select dropdown
        this.hideShowUsers('assingTeamListID');
        // Remove users when selecting team
        this.currentSelectedUsers = [];
        this.users.forEach(user => user.selected = false);
    }

    private onCloseAction(src: 'ok' | 'cancel') {
        if (src === 'ok') {
            this.onClose.emit(this.currentDetails);
        } else {
            this.onClose.emit(null);
            this.refresh();
        }
    }

    public goBusy(busy: boolean = true) {
        this.busy = busy;
        this.refresh();
    }

    public hideShowUsers(element: string) {
        if (this.userListIsShown) {
            document.getElementById(element).style.display = 'none';
            // Remove event listener when hit
            if (this.cleanupHandler) {                
                this.cleanupHandler();
                this.cleanupHandler = undefined;
            }
        } else {
            document.getElementById(element).style.display = 'block';
            // Event listener to close on click outside
            this.cleanupHandler = ownAddEventListener(document, 'mouseup', (e: any) => {
                let doc = document.getElementById(element);
                // Check if target is UL or child of UL
                if (e.target !== doc && !doc.contains(e.target)) {
                    this.hideShowUsers(element);
                }
            }, false);
        }
        this.userListIsShown = !this.userListIsShown;
    }

    public addRemoveUserToSelectedArray(event: Event, user: any) {
        // Failcheck
        if (!user || event.target['nodeName'] === 'LABEL') {
            return;
        }

        if (user.selected) {
            let index = this.currentSelectedUsers.findIndex(x => x.ID === user.ID);
            this.currentSelectedUsers.splice(index, 1);
        } else {
            this.currentSelectedUsers.push(user);

            // Remove current team when selecting user
            if (this.currentTeam) {
                this.currentTeam = null;
            }
        }
        user.selected = !user.selected;
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
export class AssignDetails {
    public Message: string;
    public TeamIDs: Array<number>;
    public UserIDs: Array<number>;
}

const ownAddEventListener = (scope, type, handler, capture) => {
    scope.addEventListener(type, handler, capture);
    return () => {
        scope.removeEventListener(type, handler, capture);    
    }
}