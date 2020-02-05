import {Component, EventEmitter} from '@angular/core';
import {IUniModal} from '@uni-framework/uni-modal';
import {ElsaCustomersService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {Router} from '@angular/router';

@Component({
    selector: 'missing-roles-modal',
    templateUrl: './missing-roles-modal.html',
    styleUrls: ['./missing-roles-modal.sass']
})
export class MissingRolesModal implements IUniModal {
    onClose = new EventEmitter();

    userIsAdmin: boolean;
    admins;

    constructor(
        private authService: AuthService,
        private elsaCustomerService: ElsaCustomersService,
        private router: Router
    ) {}

    ngOnInit() {
        const user = this.authService.currentUser;
        const contractID = user.License.Company.ContractID;
        this.elsaCustomerService.getByContractID(contractID, 'Managers').subscribe(
            customer => {
                const admins = customer.Managers;
                this.userIsAdmin = admins && admins.some(admin => admin.User && admin.User.Identity === user.GlobalIdentity);
                if (!this.userIsAdmin) {
                    this.admins = admins || [];
                }
            },
            err => console.error(err)
        );
    }

    goToSettings() {
        this.router.navigateByUrl('/settings/users');
        this.onClose.emit();
    }
}
