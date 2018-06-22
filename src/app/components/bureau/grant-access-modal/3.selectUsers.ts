import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';
import {AuthService, IAuthDetails} from '@app/authService';
import {ElsaUserLicense} from '@app/services/elsa/elsaModels';
import {ErrorService} from '@app/services/common/errorService';

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
    warning: string;

    constructor(
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private errorService: ErrorService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        this.authService.authentication$.subscribe((authentication: IAuthDetails) =>
            this.elsaCompanyLicenseService.GetAllUsers(authentication.user.License.Company.Agency.CompanyKey)
                .do(users => this.reSelectUsers(users))
                .subscribe(
                    users => this.users = users,
                    err => this.errorService.handle(err),
                )
        );
    }

    isAllSelected() {
        return this.users && this.users.every(c => !!c['_selected'])
    }

    toggleEverything(target: HTMLInputElement) {
        this.users.forEach(u => u['_selected'] = target.checked);
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
}
