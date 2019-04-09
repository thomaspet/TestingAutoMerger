import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {MatStepper} from '@angular/material';
import {CompanySettings, Company, Address, Role, UserRole} from '@uni-entities';
import {CompanyInfo} from './select-company/select-company.component';
import {ErrorService, CompanyService, RoleService, ElsaCustomersService, ElsaContractService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {Http, Headers} from '@angular/http';
import {environment} from 'src/environments/environment';
import {ElsaCustomer, ElsaContract, ElsaContractType} from '@app/models';

export enum PAGE_TYPE {
    selectLicense = 0,
    selectCompany = 1,
    selectProducts = 2,
}

@Component({
    selector: 'uni-new-company-modal',
    templateUrl: './newCompanyModal.html',
    styleUrls: ['./newCompanyModal.sass']
})
export class UniNewCompanyModal implements IUniModal, OnInit {
    @ViewChild(MatStepper) stepper: MatStepper;

    @Input() options = <IModalOptions>{};
    @Output() onClose = new EventEmitter<Company>();

    PageType = PAGE_TYPE;
    currentPage: PAGE_TYPE = PAGE_TYPE.selectLicense;

    companyInfo = <CompanyInfo>{ companySettings: <CompanySettings>{ DefaultAddress: <Address>{} } };
    selectedProductsNames: string[] = [];

    busy = false;
    companyLimitReached: boolean;
    customers: ElsaCustomer[];
    selectedContract: ElsaContract;
    roles: Role[] = [];

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private elsaCustomerService: ElsaCustomersService,
        private roleService: RoleService,
        private errorService: ErrorService,
        private companyService: CompanyService,
        private http: Http,
    ) {}

    ngOnInit() {
        this.elsaCustomerService.getAll('Contracts').subscribe(
            res => this.customers = res || [],
            () => this.customers = []
        );

        this.roleService.GetAll().subscribe(roles => this.roles = roles);
    }

    onStepChange(event) {
        this.currentPage = event.selectedIndex;
    }

    onContractSelected(contract) {
        this.companyLimitReached = false;

        if (contract.ContractType === ElsaContractType.Demo) {
            this.elsaContractService.getCompanyLicenses(contract.ID).subscribe(
                res => this.companyLimitReached = res && res.length >= 2,
                () => {}
            );
        }
    }

    createCompany() {
        this.busy = true;
        const newUserRoles: Partial<UserRole>[] = [];
        this.selectedProductsNames.forEach(name => {
            const defaultRole = this.roles.find(role => role.Name.split('.')[0] === name);
            if (defaultRole) {
                newUserRoles.push({
                    SharedRoleId: defaultRole.ID,
                    SharedRoleName: defaultRole.Name,
                    UserID: 1
                });
            }
        });

        this.companyService.createCompany(
            this.companyInfo.companySettings.CompanyName,
            this.companyInfo.companySettings,
            this.selectedContract.ID,
            this.selectedProductsNames.join()
        ).subscribe(
            (response: Company) => {
                // TODO: Remove when role assignment is implemented back-end
                if (newUserRoles && newUserRoles.length) {
                    const url = environment.BASE_URL_INIT + environment.API_DOMAINS.BUSINESS + 'userroles?bulk-insert-roles';
                    const headers = new Headers({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.authService.getToken(),
                        'CompanyKey': response.Key
                    });
                    this.http.post(url, newUserRoles, { headers: headers })
                        .finally(() => this.busy = false)
                        .subscribe(() => null);
                }
                this.onClose.emit(response);
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    close() {
        this.onClose.emit();
    }
}
