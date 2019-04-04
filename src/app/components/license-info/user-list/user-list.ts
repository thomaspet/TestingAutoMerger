import {Component} from '@angular/core';
import {ElsaUserLicense, ElsaUserLicenseType} from '@app/models';
import {ErrorService, ElsaContractService} from '@app/services/services';
import {AuthService} from '@app/authService';

@Component({
    selector: 'license-info-user-list',
    templateUrl: './user-list.html',
    styleUrls: ['./user-list.sass']
})
export class UserList {
    users: ElsaUserLicense[];
    filteredUsers: ElsaUserLicense[];
    filterValue: string;
    userType: number = -1;

    columns = [
        { header: 'Navn', field: 'UserName' },
        { header: 'Epost', field: 'Email' },
        { header: 'Lisenstype', field: '_typeText', flex: '0 0 10rem' }
    ];

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService
    ) {
        const contractID = this.authService.currentUser.License.Company.ContractID;
        this.elsaContractService.getUserLicenses(contractID).subscribe(
            res => {
                this.users = (res || []).map(user => {
                    switch (user.UserLicenseType) {
                        case ElsaUserLicenseType.Standard:
                            user['_typeText'] = 'Standard';
                        break;
                        case ElsaUserLicenseType.Accountant:
                            user['_typeText'] = 'Regnskapsfører';
                        break;
                        case ElsaUserLicenseType.Support:
                            user['_typeText'] = 'Support';
                        break;
                    }

                    return user;
                });

                this.filteredUsers = res;
            },
            err => this.errorService.handle(err)
        );
    }

    filterUsers() {
        const filteredByType = this.userType >= 0
            ? this.users.filter(u => u.UserLicenseType === +this.userType)
            : this.users;

        if (this.filterValue) {
            const filterValue = (this.filterValue || '').toLowerCase();
            this.filteredUsers = filteredByType.filter(user => {
                return (user.UserName || '').toLowerCase().includes(filterValue)
                    || (user.Email || '').toLowerCase().includes(filterValue);
            });
        } else {
            this.filteredUsers = filteredByType;
        }
    }
}
