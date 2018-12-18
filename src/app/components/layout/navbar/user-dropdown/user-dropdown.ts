import {Component} from '@angular/core';
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
    public user: UserDto;
    public licenseRole: string;

    constructor(
        private modalSerice: UniModalService,
        private authService: AuthService,
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                const user = auth.user;

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

                this.user = user;
                this.licenseRole = licenseRoles.join('/');
            }
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
