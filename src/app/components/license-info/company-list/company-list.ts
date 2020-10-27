import {Component} from '@angular/core';
import {forkJoin} from 'rxjs';
import * as moment from 'moment';

import {AuthService} from '@app/authService';
import {ElsaCompanyLicense, ElsaCustomer} from '@app/models';
import {ElsaContractService, ErrorService, SubEntityService, CompanySettingsService} from '@app/services/services';
import {ListViewColumn} from '../list-view/list-view';
import {CompanyService} from '@app/services/services';
import {UniModalService, WizardSettingsModal} from '@uni-framework/uni-modal';
import {GrantAccessModal, GrantSelfAccessModal, UniNewCompanyModal} from '@app/components/common/modals/company-modals';
import {DeletedCompaniesModal} from './deleted-companies-modal/deleted-companies-modal';
import {DeleteCompanyModal} from './delete-company-modal/delete-company-modal';
import {LicenseInfo} from '../license-info';
import {ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {NewCompanyModal} from '../new-company-modal/new-company-modal';
import {theme, THEMES} from 'src/themes/theme';
import { Company } from '@uni-entities';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'license-info-company-list',
    templateUrl: './company-list.html',
    styleUrls: ['./company-list.sass']
})
export class CompanyList {
    contractID: number;
    currentContractID: number;
    companies: ElsaCompanyLicense[];
    companyLimitReached = false;
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
        }
    ];
    contextMenu = [
        {
            label: 'Slett selskap',
            action: (company: ElsaCompanyLicense) => {
                this.deleteCompanyModal(company);
            }
        },
        {
            label: 'Gi meg selv tilgang (admin)',
            action: (company: ElsaCompanyLicense) => {
                this.grantSelfAccess(company);
            },
        },
        {
            label: 'To-faktor',
            action: (company: ElsaCompanyLicense) => {
                this.twoFactorEnabledChange(company);
            },
        }
    ];

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaContractService: ElsaContractService,
        private companyService: CompanyService,
        private licenseInfo: LicenseInfo,
        private toastService: ToastService,
        private errorService: ErrorService,
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
                this.companyService.GetAll(),
                this.elsaContractService.get(this.contractID, 'contracttypes', 'contracttypes')
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
                    this.companyLimitReached =
                        res[2].ContractTypes.MaxCompanies !== null && res[2].ContractTypes.MaxCompanies <= this.companies.length;
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
        if (theme.theme === THEMES.UE || theme.theme === THEMES.SOFTRIG) {
            this.modalService.open(UniNewCompanyModal, {
                data: { contractID: this.contractID }
            }).onClose.subscribe((company: Company) => {
                if (company && company.ID) {
                    this.authService.setActiveCompany(company);
                    this.modalService.open(WizardSettingsModal).onClose.pipe(
                        tap(() => this.handleSubEntityImport()),
                    ).subscribe(() => {
                        this.loadData();
                    }, err => this.errorService.handle(err));
                }
            });
        } else {
            this.modalService.open(NewCompanyModal, {
                data: {
                    contractID: this.contractID,
                    contractType: this.contractType
                }
            });
        }
    }

    handleSubEntityImport() {
        this.companySettingsService.getCompanySettings()
            .pipe(switchMap(companySettings =>
                this.subEntityService.checkZonesAndSaveFromEnhetsregisteret(companySettings.OrganizationNumber)
            )).take(1).subscribe();
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

    twoFactorEnabledChange(company: ElsaCompanyLicense) {
        let header, message;
        if (!company.TwoFactorEnabled) {
            header = `Slå på to-faktor pålogging for ${company.CompanyName}`;
            message = `Ved å slå på to-faktor pålogging for selskapet,
                slår du på to-faktor påloggin for alle brukere med tilgang til selskapet,
                og brukerene vil da ikke ha mulighet til å velge dette bort.
                Ønsker du å slå på to-faktor pålogging? <br><br>`;
        } else {
            header = `Slå av to-faktor pålogging for ${company.CompanyName}`;
            message = `Ved å slå av to-faktor pålogging for selskapet,
                så lar du det være opp til brukerene om de ønsker to-faktor pålogging eller ikke.
                Brukere som har to-faktor pålogging, men ønsker å slå det av for seg må gjøre dette selv.
                Ønsker du å slå av to-faktor pålogging? <br><br>`;
        }

        const onOffLabel = !company.TwoFactorEnabled ? 'på' : 'av';

        this.modalService.confirm({
            header: header,
            message: message,
            closeOnClickOutside: true,
            closeOnEscape: true,
            footerCls: 'center',
            buttonLabels: {
                accept: `Slå ${onOffLabel} to-faktor pålogging`,
                reject: 'Avbryt'
            }
        }).onClose.subscribe(res => {
            if (res === ConfirmActions.ACCEPT) {
                this.companyService.updateTwoFactorAuthentication(
                    company.ID, { TwoFactorEnabled: !company.TwoFactorEnabled })
                    .subscribe(
                    () => {
                        this.toastService.addToast(
                            'To-faktor',
                            ToastType.good,
                            ToastTime.short,
                            `To-faktor pålogging er slått ${onOffLabel} for ${company.CompanyName}`
                        );
                        this.companies.forEach(comp => {
                            if (company.ID === comp.ID) {
                                comp.TwoFactorEnabled = !company.TwoFactorEnabled;
                            }
                        });
                    }, err => {
                        this.errorService.handle('Kan ikke slå av to-faktor pålogging for selskapet, da dette er påkrevd av lisensen.');
                    }
                );
            }
        });
    }
}
