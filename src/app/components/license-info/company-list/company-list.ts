import {Component} from '@angular/core';
import {forkJoin} from 'rxjs';
import * as moment from 'moment';

import {AuthService} from '@app/authService';
import {ElsaCompanyLicense, ElsaCustomer} from '@app/models';
import {ElsaContractService, SubEntityService, CompanySettingsService} from '@app/services/services';
import {ListViewColumn} from '../list-view/list-view';
import {CompanyService} from '@app/services/services';
import {UniModalService, WizardSettingsModal} from '@uni-framework/uni-modal';
import {GrantAccessModal, GrantSelfAccessModal, UniNewCompanyModal} from '@app/components/common/modals/company-modals';
import {DeletedCompaniesModal} from './deleted-companies-modal/deleted-companies-modal';
import {DeleteCompanyModal} from './delete-company-modal/delete-company-modal';
import {LicenseInfo} from '../license-info';
import { Company, CompanySettings, SubEntity } from '@uni-entities';
import { switchMap, tap, filter } from 'rxjs/operators';

@Component({
    selector: 'license-info-company-list',
    templateUrl: './company-list.html',
    styleUrls: ['./company-list.sass']
})
export class CompanyList {
    contractID: number;
    currentContractID: number;
    companies: ElsaCompanyLicense[];
    customers: ElsaCustomer[];
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
    contextMenu = [
        {
            label: 'Slett selskap',
            action: (company: ElsaCompanyLicense) => {
                this.deleteCompanyModal(company);
            }
        },
        {
            label: 'Gi meg selv tilgang',
            action: (company: ElsaCompanyLicense) => {
                this.grantSelfAccess(company);
            },
            hidden: (company: ElsaCompanyLicense) => {
                return company['_ueCompany'];
            }
        }
    ];

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaContractService: ElsaContractService,
        private companyService: CompanyService,
        private licenseInfo: LicenseInfo,
        private subEntityService: SubEntityService,
        private companySettingsService: CompanySettingsService,
    ) {
        try {
            this.currentContractID = this.authService.currentUser.License.Company.ContractID;
            this.licenseInfo.selectedContractID$.subscribe(id => {
                this.contractID = id;
                this.loadData();
            });
        } catch (e) {
            console.error(e);
        }
    }

    loadData() {
        if (this.contractID) {
            forkJoin(
                this.elsaContractService.getCompanyLicenses(this.contractID),
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

                            license['_ueCompany'] = ueCompanies.find(c => c.Key.toLowerCase() === license.CompanyKey.toLowerCase());
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

    grantAccess() {
        this.modalService.open(GrantAccessModal, {
            data: { contractID: this.contractID }
        });
    }

    grantSelfAccess(company: ElsaCompanyLicense) {
        this.modalService.open(GrantSelfAccessModal, {
            data: {
                contractID: this.contractID,
                currentContractID: this.currentContractID,
                companyLicense: company,
                userIdentity: this.authService.currentUser.License.GlobalIdentity
            }
        }).onClose.subscribe(() => this.loadData());
    }

    createCompany() {
        this.modalService.open(UniNewCompanyModal, {
            data: { contractID: this.contractID }
        }).onClose.subscribe((company: Company) => {
            if (company && company.ID) {
                this.authService.setActiveCompany(company);
                this.modalService
                    .open(WizardSettingsModal)
                    .onClose
                    .pipe(
                        tap(() => this.handleSubEntityImport()),
                    )
                    .subscribe(() => {
                        this.loadData();
                    });
            }
        });
    }

    handleSubEntityImport() {
        this.companySettingsService
            .getCompanySettings()
            .pipe(
                switchMap(companySettings =>
                    this.subEntityService.checkZonesAndSaveFromEnhetsregisteret(companySettings.OrganizationNumber)
                ),
            )
            .subscribe();
    }

    deleteCompanyModal(company: ElsaCompanyLicense) {
        this.modalService.open(DeleteCompanyModal, {
            data: { company: company }
        }).onClose.subscribe(companyDeleted => {
            if (companyDeleted) {
                this.loadData();
            }
        });
    }

    deletedCompanies() {
        this.modalService.open(DeletedCompaniesModal, {
            data: { contractID: this.contractID }
        }).onClose.subscribe(companyRevived => {
            if (companyRevived) {
                this.loadData();
            }
        });
    }
}
