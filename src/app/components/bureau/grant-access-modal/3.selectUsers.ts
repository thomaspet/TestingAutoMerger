import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';
import {AuthService, IAuthDetails} from '@app/authService';
import {ElsaUserLicense} from '@app/services/elsa/elsaModels';
import {ErrorService} from '@app/services/common/errorService';
import {Team} from '@app/unientities';
import {TeamService} from '@app/services/common/teamService';
import {BureauCustomHttpService} from '@app/components/bureau/bureauCustomHttpService';
import {Observable} from 'rxjs';

@Component({
    selector: 'select-users-for-bulk-access',
    templateUrl: './3.selectUsers.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectUsersForBulkAccess {
    @Output()
    public next: EventEmitter<void> = new EventEmitter<void>();
    @Input()
    data: GrantAccessData;

    users: ElsaUserLicense[];
    teams: Team[];
    warning: string;

    constructor(
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private errorService: ErrorService,
        private authService: AuthService,
        private bureauHttp: BureauCustomHttpService,
    ) {}

    ngOnInit() {
        this.authService.authentication$
            .map((authentication: IAuthDetails) => authentication.user.License.Company.Agency.CompanyKey)
            .subscribe((mainCompanyKey: string) => {
                this.elsaCompanyLicenseService.GetAllUsers(mainCompanyKey)
                    .do(users => this.reSelectUsers(users))
                    .subscribe(
                        users => this.users = users,
                        err => this.errorService.handle(err),
                    );
                this.bureauHttp.get('/api/biz/teams?expand=Positions', mainCompanyKey)
                    .map(response => response.json())
                    .switchMap(teams => this.addGuidToTeamPositions(teams, mainCompanyKey))
                    .subscribe(
                        teams => this.teams = teams,
                        err => this.errorService.handle(err),
                    );
            });
    }

    isAllUsersSelected() {
        return this.users && this.users.every(u => !!u['_selected'])
    }

    toggleUsers(target: HTMLInputElement) {
        this.users.forEach(u => u['_selected'] = target.checked);
    }

    isTeamSelected(team: Team) {
        return team.Positions.every(position =>
            !!this.users.find(u => u.userIdentity === position['_GlobalIdentity'] && u['_selected'])
        );
    }

    selectTeam(target: HTMLInputElement, team: Team) {
        team.Positions.forEach(position => {
            const user = this.users.find(u => u.userIdentity === position['_GlobalIdentity']);
            if (user) {
                user['_selected'] = target.checked;
            }
        });
    }

    done() {
        const selectedUsers = this.users.filter(u => !!u['_selected']);
        if (selectedUsers.length === 0) {
            this.warning = 'Du må velge minst en bruker!';
            return;
        }
        this.data.users = selectedUsers;
        this.next.emit();
    }

    private reSelectUsers(newUsers: ElsaUserLicense[]): ElsaUserLicense[] {
        if (this.data.users) {
            newUsers.forEach(newUser => {
                if (this.data.users.some(selectedUser => selectedUser.userIdentity === newUser.userIdentity)) {
                    newUser['_selected'] = true;
                }
            });
        }
        return newUsers;
    }

    private addGuidToTeamPositions(teams: Team[], companyKey): Observable<Team[]> {
        const allUserIDs = [];
        teams.forEach(team => team.Positions.forEach(p => allUserIDs.push(p.UserID)));
        return this.bureauHttp.get(
            '/api/statistics'
            + '?model=User'
            + '&select=User.GlobalIdentity as GUID,ID as ID'
            + `&filter=ID eq ${allUserIDs.join(' OR ID eq ')}`,
            companyKey,
        )
            .map(this.bureauHttp.statisticsExtractor)
            .map((guids: {ID: number, GUID: string}[]) => {
                for (const team of teams) {
                    for (const position of team.Positions) {
                        for (const guid of guids) {
                            if (position.UserID === guid.ID) {
                                position['_GlobalIdentity'] = guid.GUID;
                            }
                        }

                    }
                }
                return teams;
            });
    }
}
