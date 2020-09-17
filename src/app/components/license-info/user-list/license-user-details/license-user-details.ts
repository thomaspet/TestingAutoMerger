import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {ElsaUserLicense, ElsaCompanyLicense, ElsaProduct, ElsaUserLicenseType} from '@app/models';
import {ElsaPurchaseService, ElsaProductService, ErrorService} from '@app/services/services';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'license-user-details',
    templateUrl: './license-user-details.html',
    styleUrls: ['./license-user-details.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetails {
    @Input() user: ElsaUserLicense;
    @Input() contractID: number;
    @Output() close = new EventEmitter();

    busy: boolean;
    gridTemplateColumns: string;
    companies: ElsaCompanyLicense[];
    userType: string;

    products: ElsaProduct[];
    purchasesPerCompany = [];

    constructor(
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService,
        private http: UniHttp,
        private purchaseService: ElsaPurchaseService,
        private productSerivce: ElsaProductService,
    ) {}

    ngOnChanges() {
        if (this.user && this.contractID) {
            this.loadData();

            switch (this.user.UserLicenseType) {
                case ElsaUserLicenseType.Standard:
                    this.userType = 'Standard';
                break;
                case ElsaUserLicenseType.Accountant:
                    this.userType = 'Regnskapsfører';
                break;
                case ElsaUserLicenseType.Support:
                    this.userType = 'Support';
                break;
            }
        }
    }

    private loadData() {
        this.busy = true;
        forkJoin(
            this.productSerivce.GetAll('IsPerUser eq true'),
            this.purchaseService.getUserPurchasesOnContract(this.user.UserIdentity, this.contractID),
            this.getCompaniesForUser(),
        ).subscribe(
            res => {
                this.products = res[0];
                const purchaseMatrix = {};

                const companies = res[2] || [];
                companies.forEach(company => {
                    purchaseMatrix[company.CompanyKey] = {
                        CompanyKey: company.CompanyKey,
                        CompanyName: company.CompanyName
                    };
                });

                (res[1] || []).forEach(purchase => {
                    if (purchaseMatrix[purchase.CompanyKey]) {
                        purchaseMatrix[purchase.CompanyKey][purchase.ProductName] = true;
                    }
                });

                const purchases = [];
                Object.values(purchaseMatrix).forEach(row => purchases.push(row));

                this.purchasesPerCompany = purchases;
                this.gridTemplateColumns = `minmax(min-content, 20rem) repeat(${this.products.length}, max-content)`;
                this.busy = false;
                this.cdr.markForCheck();

            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
                this.cdr.markForCheck();
            }
        );
    }

    private getCompaniesForUser() {
        const endpoint = `/api/userlicenses/${this.user.UserIdentity}/contracts/${this.contractID}/companylicenses`;
        return this.http.asGET()
            .usingElsaDomain()
            .withEndPoint(endpoint)
            .send()
            .pipe(map(res => {
                return (res && res.body || []).filter(company => {
                    return !moment(company.EndDate).isValid() || moment(company.EndDate).isAfter(moment(new Date()));
                });
            }));
    }
}
