import {Component} from '@angular/core';
import {ErrorService, ElsaCustomersService} from '@app/services/services';
import {AuthService} from '@app/authService';

@Component({
    selector: 'license-details',
    templateUrl: './details.html',
    styleUrls: ['./details.sass']
})
export class LicenseDetails {
    licenseOwner;
    filteredManagers: any[];
    filterValue: string;
    columns = [
        {header: 'Navn', field: 'User.Name'},
        {header: 'Epost', field: 'User.Email'},
        {header: 'Telefon', field: 'User.Phone'},
    ];

    constructor(
        private authService: AuthService,
        private elsaCustomerService: ElsaCustomersService,
        private errorService: ErrorService,
    ) {
        const contractID = this.authService.currentUser.License.Company.ContractID;
        this.elsaCustomerService.getByContractID(contractID, 'Managers').subscribe(
            res => {
                this.licenseOwner = res;
                this.filteredManagers = this.licenseOwner.Managers || [];
            },
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
