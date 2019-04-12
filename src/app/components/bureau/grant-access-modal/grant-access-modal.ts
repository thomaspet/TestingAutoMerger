import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaContract, ElsaCompanyLicense, ElsaUserLicense_deprecated, ElsaCustomer} from '@app/models';
import {MatStepper} from '@angular/material';
import {JobServerMassInviteInput, JobService, ErrorService} from '@app/services/services';

import {ExecuteForBulkAccess} from './5.execute';

export enum PAGE_TYPE {
    selectLicense = 0,
    selectCompanies,
    selectUsers,
    selectProducts,
    execute,
    receipt,
}

export interface GrantAccessData {
    customer: ElsaCustomer;
    contract: ElsaContract;
    companies: ElsaCompanyLicense[];
    users: ElsaUserLicense_deprecated[];
    products: ElsaProduct[];
}

@Component({
    selector: 'uni-module-access-modal',
    templateUrl: './grant-access-modal.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class GrantAccessModal implements IUniModal {
    @ViewChild(MatStepper) stepper: MatStepper;
    @ViewChild(ExecuteForBulkAccess) confirmAndExecuteView: ExecuteForBulkAccess;

    options: IModalOptions = {};
    onClose: EventEmitter<void> = new EventEmitter<void>();

    PageType = PAGE_TYPE;
    currentPage: PAGE_TYPE = PAGE_TYPE.selectLicense;
    lastCompletedPage: PAGE_TYPE = PAGE_TYPE.selectLicense;

    grantAccessData: GrantAccessData = <any>{};

    showProgressBar = true;

    // Stepper
    licenseSelected: boolean;
    companiesSelected: boolean;
    usersSelected: boolean;
    productsSelected: boolean;

    showReceipt: boolean;
    hangfireID: number;

    constructor(
        private jobService: JobService,
        private errorService: ErrorService
    ) {}

    onStepChange(event) {
        this.currentPage = event.selectedIndex;
    }

    sendInvites() {
        const massInvite = <JobServerMassInviteInput>{};
        massInvite.Contract = this.grantAccessData.contract;
        massInvite.CompanyLicenses = this.grantAccessData.companies;
        massInvite.UserLicenses = this.grantAccessData.users;
        massInvite.Products = this.grantAccessData.products;

        this.jobService.startJob('MassInviteBureau', 0, massInvite).subscribe(
            res => {
                this.hangfireID = res;
                this.showReceipt = true;
            },
            err => this.errorService.handle(err)
        );
    }

    close() {
        this.onClose.emit();
    }
}
