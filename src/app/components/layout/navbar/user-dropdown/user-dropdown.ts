import {Component, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {UserDto} from '@app/unientities';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {UserSettingsModal} from './user-settings-modal';
import {ElsaContractService} from '@app/services/services';
import {ElsaUserLicenseType} from '@app/models';

@Component({
    selector: 'navbar-user-dropdown',
    templateUrl: './user-dropdown.html',
    styleUrls: ['./user-dropdown.sass']
})
export class NavbarUserDropdown {
    @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;

    user: UserDto;
    contractType = '';
    userLicenseType = '';

    constructor(
        private modalSerice: UniModalService,
        private authService: AuthService,
        private elsaContractService: ElsaContractService
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                const user = auth.user;

                if (user['License'] && user['License'].ContractType) {
                    if (user['License'].ContractType.TypeName) {
                        this.elsaContractService.getContractTypesLabel(user['License'].ContractType.TypeName)
                            .subscribe(label => this.contractType = label);
                    }
                }

                if (user['License'] && user['License'].UserType) {
                    this.userLicenseType = this.getUserLicenseTypeName(user['License'].UserType.TypeID);
                }

                this.user = user;
            }
        });
    }

    public logOut() {
        this.authService.clearAuthAndGotoLogin();
    }

    public openUserSettingsModal() {
        this.trigger.closeMenu();
        this.modalSerice.open(UserSettingsModal, {
            data: this.user
        });
    }

    getUserLicenseTypeName(userLicenseType: number) {
        switch (userLicenseType) {
            case ElsaUserLicenseType.Standard:
                return 'Standard';
            case ElsaUserLicenseType.Accountant:
                return 'Regnskapsfører';
            case ElsaUserLicenseType.Revision:
                return 'Revisor';
            case ElsaUserLicenseType.Training:
                return 'Skole/opplæring';
            case ElsaUserLicenseType.Support:
                return 'Support';
            default:
                return '';
        }
    }
}
