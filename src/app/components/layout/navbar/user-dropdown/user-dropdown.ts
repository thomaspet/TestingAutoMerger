import {Component, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {UserDto} from '@app/unientities';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {UserSettingsModal} from './user-settings-modal';

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
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                const user = auth.user;

                if (user['License'] && user['License'].ContractType) {
                    if (user['License'].ContractType.TypeName) {
                        this.contractType = user['License'].ContractType.TypeName;
                    }
                }

                if (user['License'] && user['License'].UserType) {
                    if (user['License'].UserType.TypeName) {
                        this.userLicenseType = user['License'].UserType.TypeName;
                    }
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
}
