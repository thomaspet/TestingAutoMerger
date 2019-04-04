import {Component} from '@angular/core';
import {ElsaUserLicense} from '@app/models';
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

    columns = [
        { header: 'Navn', field: 'UserName' },
        { header: 'Epost', field: 'Email' }
    ];

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService
    ) {
        const contractID = this.authService.currentUser.License.Company.ContractID;
        this.elsaContractService.getUserLicenses(contractID).subscribe(
            res => {
                this.users = res;
                this.filteredUsers = res;
                console.log(res);
            },
            err => this.errorService.handle(err)
        );
    }

    filterUsers() {
        const filterValue = (this.filterValue || '').toLowerCase();
        this.filteredUsers = this.users.filter(user => {
            return (user.UserName || '').toLowerCase().includes(filterValue)
                || (user.Email || '').toLowerCase().includes(filterValue);
        });
    }
}
