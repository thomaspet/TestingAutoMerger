import {Component, Output, EventEmitter, Input, SimpleChanges} from '@angular/core';
import {ElsaContractService} from '@app/services/elsa/elsaContractService';
import {ElsaCompanyLicense} from '@app/models';
import {ErrorService} from '@app/services/common/errorService';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import * as moment from 'moment';

@Component({
    selector: 'select-companies-for-bulk-access',
    templateUrl: './2.selectCompanies.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectCompaniesForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    companyLicenses: ElsaCompanyLicense[];

    constructor(
        private elsaContractService: ElsaContractService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges() {
        if (this.data) {
            this.initData();
        }
    }

    private initData() {
        this.elsaContractService.getCompanyLicenses(this.data.contract.id).subscribe(
            companyLicenses => {
                companyLicenses = companyLicenses.filter(companyLicense => {
                    if (companyLicense.endDate && moment(companyLicense.endDate).isValid()) {
                        return moment(companyLicense.endDate).isAfter(moment());
                    } else {
                        return true;
                    }
                });

                if (this.data.companies && this.data.companies.length) {
                    companyLicenses.forEach(license => {
                        if (this.data.companies.some(c => c.CompanyKey === license.CompanyKey)) {
                            license['_selected'] = true;
                        }
                    });
                }

                this.companyLicenses = companyLicenses;
            },
            err => this.errorService.handle(err),
        );
    }

    onSelectionChange() {
        this.data.companies = this.companyLicenses.filter(c => !!c['_selected']);
        this.stepComplete.emit(this.data.companies.length > 0);
    }
}
