import {Component} from '@angular/core';
import {ElsaUserLicense, ElsaUserLicenseType} from '@app/models';
import {ErrorService, ElsaContractService} from '@app/services/services';
import {LicenseInfo} from '../license-info';
import {IContextMenuItem} from '@uni-framework/ui/unitable';

@Component({
    selector: 'license-user-list',
    templateUrl: './license-user-list.html',
    styleUrls: ['./license-user-list.sass']
})
export class UserList {
    contractID: number;
    users: ElsaUserLicense[];
    filteredUsers: ElsaUserLicense[];
    filterValue: string;
    selectedUserType = -1;
    selectedUserTypeName = 'Alle';

    userTypeDropdown: IContextMenuItem[] = [
        {
            label: 'Alle',
            action: () => this.filterUsers(-1, 'Alle'),
        },
        {
            label: 'Standard',
            action: () => this.filterUsers(0, 'Standard'),
        },
        {
            label: 'Regnskapsfører',
            action: () => this.filterUsers(1, 'Regnskapsfører'),
        },
        {
            label: 'Supportbruker',
            action: () => this.filterUsers(10, 'Supportbruker'),
        },
    ];

    selectedUser: ElsaUserLicense;
    detailsVisible: boolean;

    columns = [
        { header: 'Navn', field: 'UserName' },
        { header: 'Epost', field: 'Email' },
        { header: 'Brukertype', field: '_typeText', flex: '0 0 10rem' },
        { header: 'Status', field: '_status', flex: '0 0 7rem' },
    ];

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
        private licenseInfo: LicenseInfo,
    ) {
        this.licenseInfo.selectedContractID$.subscribe(id => {
            this.contractID = id;
            this.loadData();
        });
    }

    loadData() {
        this.elsaContractService.getUserLicenses(this.contractID).subscribe(
            users => {
                this.users = users.map(user => {
                    user['_status'] = user.StatusCode === 11 ? 'Deaktivert' : 'Aktiv';

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

                this.filteredUsers = this.users;
            },
            err => console.error(err)
        );
    }

    filterUsers(usertype: number, usertypeName: string) {
        this.selectedUserTypeName = usertypeName;
        this.selectedUserType = usertype;
        const filteredByType = this.selectedUserType >= 0
            ? this.users.filter(u => u.UserLicenseType === +this.selectedUserType)
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
