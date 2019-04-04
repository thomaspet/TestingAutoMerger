import {Component} from '@angular/core';
import {AuthService} from '@app/authService';
import {ElsaCompanyLicense, ElsaCompanyLicenseStatus} from '@app/models';
import {ElsaContractService} from '@app/services/services';

@Component({
    selector: 'license-info-company-list',
    templateUrl: './company-list.html',
    styleUrls: ['./company-list.sass']
})
export class CompanyList {
    companies: ElsaCompanyLicense[];
    filteredCompanies: ElsaCompanyLicense[];
    filterValue: string;
    columns = [
        { header: 'Selskapsnavn', field: 'CompanyName' },
        { header: 'CompanyName', field: '_orgNumberText' },
    ];

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService
    ) {
        let contractID;
        try {
            contractID = this.authService.currentUser.License.Company.ContractID;
        } catch (e) {
            console.error(e);
        }

        if (contractID) {
            this.elsaContractService.getCompanyLicenses(contractID).subscribe(
                licenses => {
                    this.companies = (licenses || [])
                        .filter(license => license.StatusCode === ElsaCompanyLicenseStatus.Active)
                        .map(license => {
                            if (license.OrgNumber) {
                                license['_orgNumberText'] = license.OrgNumber.match(/.{1,3}/g).join(' ');
                            }
                            return license;
                        });

                    this.filteredCompanies = this.companies;
                },
                err => {
                    console.error(err);
                    this.companies = [];
                }
            );
        }
    }

    filterCompanies() {
        const filterValue = (this.filterValue || '').toLowerCase();
        this.filteredCompanies = this.companies.filter(company => {
            return (company.CompanyName || '').toLowerCase().includes(filterValue)
                || (company['_orgNumberText'] || '').toLowerCase().includes(filterValue);
        });
    }
}
