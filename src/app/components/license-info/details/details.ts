import {Component} from '@angular/core';
import {ErrorService, ElsaCustomersService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {AddAdminModal} from '../add-admin-modal/add-admin-modal';

@Component({
    selector: 'license-details',
    templateUrl: './details.html',
    styleUrls: ['./details.sass']
})
export class LicenseDetails {
    contractID: number;
    licenseOwner;
    filteredManagers: any[];
    filterValue: string;

    isAdmin: boolean;

    columns = [
        {header: 'Navn', field: 'User.Name'},
        {header: 'Epost', field: 'User.Email'},
        {header: 'Telefon', field: 'User.Phone'},
    ];

    contextMenu;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaCustomerService: ElsaCustomersService,
        private errorService: ErrorService,
    ) {
        this.contractID = this.authService.currentUser.License.Company.ContractID;
        this.loadData();
    }

    loadData() {
        this.elsaCustomerService.getByContractID(this.contractID, 'Managers').subscribe(
            res => {
                this.licenseOwner = res;
                this.filteredManagers = this.licenseOwner.Managers || [];

                this.isAdmin = this.authService.currentUser.License.CustomerAgreement.CanAgreeToLicense;
                if (this.isAdmin) {
                    this.contextMenu = [{
                        label: 'Fjern som administrator',
                        action: (manager) => this.removeAdmin(manager)
                    }];
                }
            },
            err => this.errorService.handle(err)
        );
    }

    addAdmin() {
        this.modalService.open(AddAdminModal, {
            header: 'Legg til administrator',
            data: {
                customer: this.licenseOwner,
                contractID: this.contractID
            },
        }).onClose.subscribe(changes => {
            if (changes) {
                this.loadData();
            }
        });
    }

    removeAdmin(manager) {
        this.elsaCustomerService.removeAdmin(this.licenseOwner.ID, manager.ID).subscribe(
            () => this.loadData(),
            err => this.errorService.handle(err)
        );
    }

    filterManagers() {
        const filterValue = (this.filterValue || '').toLowerCase();
        this.filteredManagers = (this.licenseOwner.Managers || []).filter(manager => {
            return (manager.User.Name || '').toLowerCase().includes(filterValue)
                || (manager.User.Email || '').toLowerCase().includes(filterValue)
                || (manager.User.Phone || '').toLowerCase().includes(filterValue);
        });
    }
}
