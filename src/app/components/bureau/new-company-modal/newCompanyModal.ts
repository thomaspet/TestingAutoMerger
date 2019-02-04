import {Component, ViewChild, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {MatStepper} from '@angular/material';
import {CompanySettings, Company, Address, Role, UserRole} from '@uni-entities';
import {CompanyInfo} from './select-company/select-company.component';
import {ErrorService, CompanyService, RoleService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {Http, Headers} from '@angular/http';
import {environment} from 'src/environments/environment';

export enum PAGE_TYPE {
    selectCompany = 0,
    selectLicense,
    selectProducts,
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

    currentPage: PAGE_TYPE = PAGE_TYPE.selectCompany;
    lastCompletedPage: PAGE_TYPE = PAGE_TYPE.selectLicense;

    companyInfo = <CompanyInfo>{ companySettings: <CompanySettings>{ DefaultAddress: <Address>{} } };
    contractID = 0;
    selectedProductsNames: string[] = [];

    busy = false;
    roles: Role[] = [];

    constructor(
        private authService: AuthService,
        private roleService: RoleService,
        private errorService: ErrorService,
        private companyService: CompanyService,
        private http: Http,
    ) {}

    ngOnInit() {
        this.roleService.GetAll().subscribe(roles => this.roles = roles);
    }

    onStepChange(event) {
        this.currentPage = event.selectedIndex;
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
            this.contractID,
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
            err => this.errorService.handle(err)
        );
    }

    close() {
        this.onClose.emit();
    }

    isCurrentStepValid(): boolean {
        switch (this.currentPage) {
            case PAGE_TYPE.selectCompany:
                return this.companyInfo.valid;
            case PAGE_TYPE.selectLicense:
                return this.contractID > 0;
            case PAGE_TYPE.selectProducts:
                return this.selectedProductsNames.length > 0;
        }
    }
}
