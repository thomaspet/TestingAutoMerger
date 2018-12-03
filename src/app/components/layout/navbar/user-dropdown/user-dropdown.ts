import {Component} from '@angular/core';
import {User} from '@app/unientities';
import {UserService, ErrorService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {UserSettingsModal} from './user-settings-modal';

@Component({
    selector: 'navbar-user-dropdown',
    templateUrl: './user-dropdown.html',
    styleUrls: ['./user-dropdown.sass']
})
export class NavbarUserDropdown {
    public user: User;
    public licenseRole: string;

    constructor(
        private userService: UserService,
        private modalSerice: UniModalService,
        private authService: AuthService,
        private errorService: ErrorService
    ) {
        this.userService.getCurrentUser().subscribe(user => {
            this.user = user;

            const licenseRoles: string[] = [];
            if (user['License'] && user['License'].ContractType) {
                if (user['License'].ContractType.TypeName) {
                    licenseRoles.push(user['License'].ContractType.TypeName);
                }
            }
            if (user['License'] && user['License'].UserType) {
                if (user['License'].UserType.TypeName) {
                    licenseRoles.push(user['License'].UserType.TypeName);
                }
            }

            this.licenseRole = licenseRoles.join('/');
        });
    }

    public logOut() {
        this.authService.clearAuthAndGotoLogin();
    }

    public openUserSettingsModal() {
        this.modalSerice.open(UserSettingsModal, {
            data: this.user
        });
    }
}
