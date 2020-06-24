import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {forkJoin} from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';

import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {CompanySettings, Company, Role, UserRole} from '@uni-entities';
import {CompanyInfo} from './select-company/select-company.component';
import {AuthService} from '@app/authService';
import {ElsaCustomer, ElsaContract, ElsaContractType, ElsaProduct, ElsaProductType} from '@app/models';
import {
    ErrorService,
    CompanyService,
    RoleService,
    ElsaCustomersService,
    ElsaContractService,
    ElsaProductService
} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

export enum STEPS {
    selectLicense = 0,
    selectCompany = 1,
    selectProducts = 2,
    selectTemplate = 3,
}

@Component({
    selector: 'uni-new-company-modal',
    templateUrl: './newCompanyModal.html',
    styleUrls: ['./newCompanyModal.sass']
})
export class UniNewCompanyModal implements IUniModal, OnInit {
    @ViewChild(MatStepper, { static: true }) stepper: MatStepper;

    @Input() options = <IModalOptions>{};
    @Output() onClose = new EventEmitter<Company>();

    steps = STEPS;
    busy = false;
    currentStep = STEPS.selectLicense;
    lastStep = STEPS.selectProducts;
    companyLimitReached: boolean;

    templateCompanies: Company[];
    products: ElsaProduct[];
    roles: Role[] = [];

    currentContractID: number;
    selectedContract: ElsaContract;
    selectedTemplateCompany: Company;
    selectedProductsNames: string[] = [];

    companyInfo = <CompanyInfo> {
        companySettings: <CompanySettings> { DefaultAddress: {} },
        isTemplate: false
    };

    constructor(
        private authService: AuthService,
        private elsaProductService: ElsaProductService,
        private elsaContractService: ElsaContractService,
        private elsaCustomerService: ElsaCustomersService,
        private roleService: RoleService,
        private errorService: ErrorService,
        private companyService: CompanyService,
        private http: HttpClient,
        private toastService: ToastService,
    ) {}

    ngOnInit() {
        this.busy = true;
        const modalData = this.options && this.options.data || {};
        if (modalData.contractID) {
            this.currentContractID = modalData.contractID;
        }
        this.companyService.GetAll().subscribe(
            res => {
                this.templateCompanies = res.filter(c => c.IsTemplate);
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.templateCompanies = [];
                this.busy = false;
            }
        );

        this.elsaProductService.invalidateCache();
        this.elsaProductService.GetAll().subscribe(
            res => this.products = (res || []).filter(p => p.ProductType === ElsaProductType.Module),
            err => this.errorService.handle(err)
        );

        this.roleService.GetAll().subscribe(roles => this.roles = roles);
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

    onCompanyInfoChange() {
        const hasTemplateCompanies = this.templateCompanies && this.templateCompanies.length;
        const creatingTemplate = this.companyInfo && this.companyInfo.isTemplate;
        this.selectedTemplateCompany = undefined;
        this.lastStep = hasTemplateCompanies && !creatingTemplate
            ? STEPS.selectTemplate : STEPS.selectProducts;
    }

    onTemplateSelected(template) {
        this.selectedTemplateCompany = template;
    }

    createCompany() {
        this.busy = true;

        if (this.selectedTemplateCompany) {
            this.companyService.createFromTemplate(
                this.selectedTemplateCompany.Key,
                this.companyInfo.companySettings,
                this.selectedProductsNames,
                this.selectedContract.ID
            ).subscribe(
                () => {
                    this.toastService.addToast(
                        'Oppretting fra malklient startet',
                        ToastType.good,
                        10,
                        'Denne jobben tar vanligvis et par minutter. Du vil få epost når klienten er klar til bruk'
                    );

                    this.onClose.emit();
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
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

            const companySettings = this.companyInfo.isTemplate ? null : this.companyInfo.companySettings;
            this.companyService.createCompany(
                this.companyInfo.companySettings.CompanyName,
                companySettings,
                this.selectedContract.ID,
                this.selectedProductsNames.join(),
                this.companyInfo.isTemplate
            ).subscribe(
                (response: Company) => {
                    // TODO: Remove when role assignment is implemented back-end
                    if (newUserRoles && newUserRoles.length) {
                        const url = environment.BASE_URL_INIT + environment.API_DOMAINS.BUSINESS + 'userroles?bulk-insert-roles';

                        this.http.post(url, newUserRoles, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.authService.jwt,
                                'CompanyKey': response.Key
                            }
                        }).subscribe(
                            () => this.busy = false,
                            () => this.busy = false
                        );
                    }
                    this.onClose.emit(response);
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        }
    }

    close() {
        this.onClose.emit();
    }
}
