import {Component} from '@angular/core';
import {AuthService} from '@app/authService';
import {ElsaCompanyLicense} from '@app/models';
import {ElsaContractService} from '@app/services/services';
import {ListViewColumn} from '../list-view/list-view';
import {CompanyService} from '@app/services/services';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'license-info-company-list',
    templateUrl: './company-list.html',
    styleUrls: ['./company-list.sass']
})
export class CompanyList {
    companies: ElsaCompanyLicense[];
    filteredCompanies: ElsaCompanyLicense[];
    filterValue: string;
    columns: ListViewColumn[] = [
        {
            header: 'Selskapsnavn',
            field: 'CompanyName',
            conditionalCls: (row) => row['_ueCompany'] ? 'clickable' : '',
            click: (row) => {
                if (row['_ueCompany']) {
                    this.authService.setActiveCompany(row['_ueCompany'], '/');
                }
            }
        },
        {
            header: 'Organisasjonsnummer',
            field: '_orgNumberText'
        },
    ];

    constructor(
        private authService: AuthService,
        private elsaContractService: ElsaContractService,
        private companyService: CompanyService
    ) {
        let contractID;
        try {
            contractID = this.authService.currentUser.License.Company.ContractID;
        } catch (e) {
            console.error(e);
        }

        if (contractID) {
            forkJoin(
                this.elsaContractService.getCompanyLicenses(contractID),
                this.companyService.GetAll()
            ).subscribe(
                res => {
                    const ueCompanies = res[1] || [];
                    this.companies = (res[0] || [])
                        .filter(license => {
                            if (moment(license.EndDate).isValid()) {
                                return moment(license.EndDate).isAfter(moment(new Date()));
                            } else {
                                return true;
                            }
                        })
                        .map(license => {
                            if (license.OrgNumber) {
                                license['_orgNumberText'] = license.OrgNumber.match(/.{1,3}/g).join(' ');
                            }

                            license['_ueCompany'] = ueCompanies.find(c => c.Key === license.CompanyKey);
                            return license;
                        });

                    this.filteredCompanies = this.companies;
                },
                err => console.error(err)
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
