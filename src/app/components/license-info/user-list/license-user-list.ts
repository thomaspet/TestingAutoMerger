import {Component} from '@angular/core';
import {ElsaUserLicense, ElsaUserLicenseType} from '@app/models';
import {ErrorService, ElsaContractService} from '@app/services/services';
import {AuthService} from '@app/authService';

@Component({
    selector: 'license-user-list',
    templateUrl: './license-user-list.html',
    styleUrls: ['./license-user-list.sass']
})
export class UserList {
    users: ElsaUserLicense[];
    filteredUsers: ElsaUserLicense[];
    filterValue: string;
    userType: number = -1;

    selectedUser: ElsaUserLicense;
    detailsVisible: boolean;

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
                const users = (res || []).filter(user => user.UserName !== 'System User');
                this.users = users.map(user => {
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

    onUserSelected(user) {
        this.selectedUser = user;
        this.detailsVisible = true;
    }
}
