import {Component, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaCustomer, ElsaContract, ElsaCompanyLicense, ElsaUserLicense} from '@app/models';
import {
    ErrorService,
    ElsaProductService,
    ElsaContractService,
    JobServerMassInviteInput,
    JobService,
} from '@app/services/services';

export interface GrantAccessData {
    customer: ElsaCustomer;
    contract: ElsaContract;
    companies: ElsaCompanyLicense[];
    users: ElsaUserLicense[];
    products: ElsaProduct[];
}

@Component({
    selector: 'grant-self-access-modal',
    templateUrl: './grant-self-access-modal.html',
    styleUrls: ['./grant-self-access-modal.sass']
})
export class GrantSelfAccessModal implements IUniModal {

    options: IModalOptions = {};
    initData;
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    sendingInvite: boolean;
    missingProduct = true;

    grantAccessData: GrantAccessData = <any>{};
    hangfireID: number;
    products: ElsaProduct[];

    constructor(
        private errorService: ErrorService,
        private elsaProductService: ElsaProductService,
        private elsaContractService: ElsaContractService,
        private jobService: JobService,
    ) {}

    ngOnInit() {
        this.initData = this.options.data || {};

        if (this.initData.contractID && this.initData.userIdentity && this.initData.companyLicense) {
            this.busy = true;
            forkJoin(
                this.elsaContractService
                    .get(this.initData.contractID, 'id,customerid,contracttype,startdate,statuscode,enddate,settleduntil'),
                this.elsaContractService.getUserLicense(this.initData.contractID, this.initData.userIdentity),
                this.elsaProductService.GetAll()
            ).pipe(
                finalize(() => this.busy = false)
            ).subscribe(
                res => {
                    this.grantAccessData.contract = res[0];
                    if (!this.grantAccessData.users) {
                        this.grantAccessData.users = [];
                    }
                    this.grantAccessData.users.push(res[1]);
                    if (!this.grantAccessData.companies) {
                        this.grantAccessData.companies = [];
                    }
                    this.grantAccessData.companies.push(this.initData.companyLicense);
                    this.products = res[2].filter(product => {
                        return product.ProductTypeName === 'Module'
                            && product.IsPerUser
                            && product.Name !== 'Complete';
                    });
                    this.products.forEach(product => product['_selected'] = false);
                },
                err => this.errorService.handle(err),
            );
        }
    }

    onSelectProduct(product) {
        product['_selected'] = !product['_selected'];
        this.grantAccessData.products = this.products.filter(u => !!u['_selected']);
        this.missingProduct = this.grantAccessData.products.length === 0;
    }

    sendSelfInvite() {
        const selfInvite = <JobServerMassInviteInput>{};
        selfInvite.Contract = this.grantAccessData.contract;
        selfInvite.CompanyLicenses = this.grantAccessData.companies;
        selfInvite.UserLicenses = this.grantAccessData.users;
        selfInvite.Products = this.grantAccessData.products;

        this.busy = true;
        this.jobService.startJob('MassInviteBureau', 0, selfInvite).subscribe(
            res => {
                this.busy = false;
                this.hangfireID = res;
                this.sendingInvite = true;
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            }
        );
    }
}
