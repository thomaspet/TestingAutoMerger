import {Component, Output, EventEmitter, Input} from '@angular/core';
import {ElsaContractService} from '@app/services/elsa/elsaContractService';
import {ElsaCompanyLicense} from '@app/models';
import {ErrorService} from '@app/services/common/errorService';
import {GrantAccessData} from './grant-access-modal';
import * as moment from 'moment';

@Component({
    selector: 'select-companies-for-bulk-access',
    templateUrl: './2.selectCompanies.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectCompaniesForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    busy = false;

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges() {
        if (this.data.contract && !this.data.StoredData?.companylicenses) {
            this.initData();
        }
    }

    initData() {
        this.busy = true;
        this.elsaContractService.getCompanyLicenses(this.data.contract.ID).subscribe(
            companyLicenses => {
                const today = new Date();
                companyLicenses = companyLicenses.filter(companyLicense => {
                    return !moment(companyLicense.EndDate).isValid()
                        ||  moment(companyLicense.EndDate).isAfter(moment(today));
                });

                if (this.data.companies && this.data.companies.length) {
                    companyLicenses.forEach(license => {
                        if (this.data.companies.some(c => c.CompanyKey === license.CompanyKey)) {
                            license['_selected'] = true;
                            this.stepComplete.emit(true);
                        }
                    });
                }
                this.busy = false;
                this.data.StoredData.companylicenses = companyLicenses;

            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    onSelectionChange() {
        this.data.companies = this.data.StoredData.companylicenses.filter(company => !!company['_selected']);
        this.stepComplete.emit(this.data.companies.length > 0);
    }
}
