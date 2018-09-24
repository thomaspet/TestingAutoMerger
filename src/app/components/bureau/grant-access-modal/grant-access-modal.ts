import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, UniConfirmModalV2} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaContract, ElsaCompanyLicense, ElsaUserLicense} from '@app/services/elsa/elsaModels';
import {MatStepper} from '@angular/material';
import {BureauCustomHttpService} from '@app/components/bureau/bureauCustomHttpService';
import {IAuthDetails, AuthService} from '@app/authService';

import {JobServerMassInviteInput, JobService, ErrorService} from '@app/services/services';

import {ExecuteForBulkAccess} from './5.execute';
import { Observable } from 'rxjs';

export enum PAGE_TYPE {
    selectLicense = 0,
    selectCompanies,
    selectUsers,
    selectProducts,
    execute,
    receipt,
}

export interface GrantAccessData {
    contract: ElsaContract;
    companies: ElsaCompanyLicense[];
    users: ElsaUserLicense[];
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

    PageType = PAGE_TYPE;

    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<void> = new EventEmitter<void>();

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
        private bureauHttp: BureauCustomHttpService,
        private modalService: UniModalService,
        private authService: AuthService,
        private jobService: JobService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        this.authService.authentication$.take(1).subscribe((auth: IAuthDetails) => {
            const mainCompanyKey = auth.user.License.Company.Agency.CompanyKey;
            const mainCompanyName = auth.user.License.Company.Agency.Name;

            this.bureauHttp.hasAccessToCompany(mainCompanyKey)
                .catch(err => {
                    this.errorService.handle(err);
                    return Observable.of(false);
                })
                .subscribe(hasAccess => {
                    if (!hasAccess) {
                        this.close();
                        this.modalService.open(UniConfirmModalV2, {
                            buttonLabels: {accept: 'OK'},
                            header: 'Ikke tilgang',
                            message: `Du må ha administrator tilgang i hovedselskapet "${mainCompanyName}" for å bruke bulk invitasjoner`,
                        }).onClose.subscribe(() => {});
                    }
                });
        });
    }

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
