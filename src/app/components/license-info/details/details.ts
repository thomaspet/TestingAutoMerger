import {Component} from '@angular/core';
import {ErrorService, ElsaCustomersService, ElsaContractService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {AddAdminModal} from '../add-admin-modal/add-admin-modal';
import {ElsaCompanyLicense} from '@app/models';
import {cloneDeep} from 'lodash';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'license-details',
    templateUrl: './details.html',
    styleUrls: ['./details.sass']
})
export class LicenseDetails {
    contractID: number;
    customer;
    filteredManagers: any[];
    filterValue: string;
    lisenceAgreementUrl = environment.LICENSE_AGREEMENT_URL;

    isAdmin: boolean;

    columns = [
        {header: 'Navn', field: 'User.Name'},
        {header: 'Epost', field: 'User.Email'},
        {header: 'Telefon', field: 'User.Phone'},
    ];

    mainCompany: ElsaCompanyLicense;
    mainCompanyKey: string;
    mainCompanyEditMode: boolean;
    companyLicenses: ElsaCompanyLicense[];
    contextMenu;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {
        this.contractID = this.authService.currentUser.License.Company.ContractID;
        this.loadData();
    }

    loadData() {
        this.elsaCustomerService.getByContractID(this.contractID, 'Managers').subscribe(
            res => {
                this.customer = res;
                this.filterManagers();

                this.isAdmin = this.authService.currentUser.License.CustomerAgreement.CanAgreeToLicense;
                if (this.isAdmin) {
                    this.contextMenu = [{
                        label: 'Fjern som administrator',
                        action: (manager) => this.removeAdmin(manager)
                    }];

                    this.elsaContractService.getCompanyLicenses(this.contractID).subscribe(
                        companies => {
                            this.companyLicenses = companies;
                            this.mainCompany = companies.find(c => c.CompanyKey === this.customer.CompanyKey);
                            this.mainCompanyKey = this.mainCompany && this.mainCompany.CompanyKey;
                        },
                        err => console.error(err)
                    );
                }
            },
            err => this.errorService.handle(err)
        );
    }

    saveMainCompany() {
        if (this.mainCompanyKey && this.mainCompanyKey !== this.customer.CompanyKey) {
            const customer = cloneDeep(this.customer);
            delete customer.Managers;
            customer.CompanyKey = this.mainCompanyKey;

            this.elsaCustomerService.put(customer).subscribe(
                () => {
                    this.loadData();
                    this.mainCompanyEditMode = false;
                },
                err => {
                    this.errorService.handle(err);
                    this.cancelMainCompanyEdit();
                }
            );
        } else {
            this.cancelMainCompanyEdit();
        }
    }

    cancelMainCompanyEdit() {
        this.mainCompanyKey = this.mainCompany && this.mainCompany.CompanyKey;
        this.mainCompanyEditMode = false;
    }

    addAdmin() {
        this.modalService.open(AddAdminModal, {
            header: 'Legg til administrator',
            data: {
                customer: this.customer,
                contractID: this.contractID
            },
        }).onClose.subscribe(changes => {
            if (changes) {
                this.loadData();
            }
        });
    }

    removeAdmin(manager) {
        this.elsaCustomerService.removeAdmin(this.customer.ID, manager.ID).subscribe(
            () => this.loadData(),
            err => this.errorService.handle(err)
        );
    }

    filterManagers() {
        const filterValue = (this.filterValue || '').toLowerCase();
        if (this.filterValue) {
            this.filteredManagers = (this.customer.Managers || []).filter(manager => {
                return (manager.User.Name || '').toLowerCase().includes(filterValue)
                    || (manager.User.Email || '').toLowerCase().includes(filterValue)
                    || (manager.User.Phone || '').toLowerCase().includes(filterValue);
            });
        } else {
            this.filteredManagers = this.customer.Managers || [];
        }
    }
}
