import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';
import {AuthService, IAuthDetails} from '@app/authService';
import {ElsaUserLicense} from '@app/models';
import {ErrorService} from '@app/services/common/errorService';

@Component({
    selector: 'select-users-for-bulk-access',
    templateUrl: './3.selectUsers.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectUsersForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    users: ElsaUserLicense[];

    constructor(
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private errorService: ErrorService,
        private authService: AuthService,
    ) {}

    ngOnChanges() {
        if (this.data) {
            this.initData();
        }
    }

    private initData() {
        this.authService.authentication$
            .take(1)
            .subscribe((authentication: IAuthDetails) => {
                this.elsaCompanyLicenseService.GetAllUsers(
                    authentication.user.License.Company.Agency.CompanyKey
                ).subscribe(
                    users => {
                        if (this.data.users && this.data.users.length) {
                            users.forEach(user => {
                                if (this.data.users.some(u => u.userIdentity === user.userIdentity)) {
                                    user['_selected'] = true;
                                }
                            });
                        }

                        this.users = users;

                    },
                    err => this.errorService.handle(err),
                );
            }
        );
    }

    onSelectionChange() {
        this.data.users = this.users.filter(u => !!u['_selected']);
        this.stepComplete.emit(this.data.users.length > 0);
    }
}
