import {Component, HostBinding} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {take} from 'rxjs/operators';
import {CompanySettings} from '@uni-entities';
import {AuthService} from '@app/authService';
import {CompanyActionsModal, UniModalService} from '@uni-framework/uni-modal';
import {ElsaCustomer} from '@app/models';
import {environment} from 'src/environments/environment';
import {
    CompanySettingsService,
    ErrorService,
    ElsaContractService,
    ElsaCustomersService,
    InitService,
} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {CompanyDetails} from './company-details-form/company-details-form';

@Component({
    selector: 'contract-activation',
    templateUrl: './contract-activation.html',
    styleUrls: ['./contract-activation.sass'],
})
export class ContractActivation {
    @HostBinding('class.overlay') trialExpired: boolean;

    isSrEnvironment = environment.isSrEnvironment;
    lisenceAgreementUrl = environment.LICENSE_AGREEMENT_URL;

    busy: boolean;
    isTestCompany = false;
    companyCreationMode = false;
    companyCreationBusy = false;

    isDemoLicense: boolean;
    canActivateContract: boolean;

    contractID: number;
    companySettings: CompanySettings;
    elsaCustomer: ElsaCustomer;

    companyDetails: CompanyDetails = {};

    isEnk: boolean;
    includeVat: boolean;
    includeSalary: boolean;

    hasAcceptedTerms = false;
    isBureau = false;
    isSrCustomer = false;

    constructor(
        private initService: InitService,
        private toastService: ToastService,
        private authService: AuthService,
        private modalService: UniModalService,
        private router: Router,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService,
    ) {
        this.authService.authentication$.pipe(take(1)).subscribe(auth => {
            this.trialExpired = auth && !auth.hasActiveContract;
            try {
                const license = auth.user.License;
                this.contractID = license.Company && license.Company.ContractID;

                this.canActivateContract = license.CustomerAgreement.CanAgreeToLicense;
                this.isDemoLicense = license.ContractType.TypeName === 'Demo';

                if (this.canActivateContract && this.isDemoLicense) {
                    this.isTestCompany = auth && auth.activeCompany && auth.activeCompany.IsTest;
                    if (!this.isTestCompany) {
                        this.initActivationData(license.Company.ContractID);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    canDeactivate(routeToActivate: string) {
        if (this.trialExpired) {
            // Allow company change and logout to pass canDeactivate check
            return routeToActivate.includes('reload') || routeToActivate.includes('init');
        } else {
            return true;
        }
    }

    private initActivationData(contractID: number) {
        forkJoin(
            this.companySettingsService.Get(1),
            this.elsaCustomerService.getByContractID(contractID)
        ).subscribe(
            res => {
                const settings: CompanySettings = res[0] || {};
                const customer = <any> res[1] || {};

                this.companySettings = <CompanySettings> {
                    ID: settings.ID,
                    CompanyName: settings.CompanyName,
                    OrganizationNumber: settings.OrganizationNumber,
                    DefaultAddress: settings.DefaultAddress || <any> {_createguid: this.companySettingsService.getNewGuid()}
                };

                this.elsaCustomer = customer;

                this.companyDetails = {
                    CompanyName: this.companySettings.CompanyName,
                    OrganizationNumber: this.companySettings.OrganizationNumber,
                    Address: this.companySettings.DefaultAddress.AddressLine1,
                    PostalCode: this.companySettings.DefaultAddress.PostalCode,
                    City: this.companySettings.DefaultAddress.City,
                    Country: this.companySettings.DefaultAddress.Country
                };
            },
            err => this.errorService.handle(err)
        );
    }

    activate() {
        this.companySettings.CompanyName = this.companyDetails.CompanyName;
        this.companySettings.OrganizationNumber = this.companyDetails.OrganizationNumber;
        this.companySettings.DefaultAddress.AddressLine1 = this.companyDetails.Address;
        this.companySettings.DefaultAddress.PostalCode = this.companyDetails.PostalCode;
        this.companySettings.DefaultAddress.City = this.companyDetails.City;
        this.companySettings.DefaultAddress.Country = this.companyDetails.Country;

        if (!this.companySettings.CompanyName || !this.companySettings.OrganizationNumber) {
            this.toastService.toast({
                title: 'Mangler data',
                message: 'Firmanavn og organisasjonsnummer er påkrevde felter',
                type: ToastType.warn,
                duration: 5
            });

            return;
        }

        if (!this.elsaCustomer.ContactPerson || this.elsaCustomer.ContactPerson.length < 5) {
            this.toastService.toast({
                title: 'Navn på kontaktperson må være mer enn 5 bokstaver'
            });
        }

        this.busy = true;
        this.elsaCustomer.Name = this.elsaCustomer.ContactPerson;
        forkJoin(
            this.companySettingsService.Put(1, this.companySettings),
            this.elsaCustomerService.put(<any> this.elsaCustomer)
        ).subscribe(
            () => {
                if (this.contractID) {
                    this.elsaContractService.activateContract(this.contractID, this.isBureau).subscribe(
                        () => {
                            setTimeout(() => {
                                this.authService.loadCurrentSession().subscribe(() => {
                                    this.trialExpired = false;
                                    this.modalService.open(CompanyActionsModal, { header: 'Kundeforhold aktivert' });
                                    this.router.navigateByUrl('/');
                                });

                                if (this.isSrEnvironment && !this.isSrCustomer) {
                                    let url = 'https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/kjop/bli-kunde.html';
                                    if (this.companySettings.OrganizationNumber) {
                                        url += `?bm-orgNumber=${this.companySettings.OrganizationNumber}`;
                                    }
                                    window.open(url, '_blank');
                                }
                            }, 250);
                        },
                        err => {
                            this.errorService.handle(err);
                            this.busy = false;
                        }
                    );
                }
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    createCompany() {
        if (!this.companyDetails || !this.companyDetails.CompanyName || !this.companyDetails.OrganizationNumber) {
            this.toastService.toast({
                title: 'Mangler data',
                message: 'Firmanavn og organisasjonsnummer er påkrevde felter',
                type: ToastType.warn,
                duration: 5
            });

            return;
        }

        this.initService.getTemplates().subscribe(templates => {
            const template = this.getCorrectTemplate(templates);
            const body = {
                CompanyName: this.companyDetails.CompanyName,
                ContractID: this.contractID,
                CompanySettings: this.companyDetails,
                ProductNames: 'SrBundle',
                TemplateCompanyKey: template && template.Key
            };

            this.initService.createCompany(body).subscribe(
                () => {
                    this.companyCreationBusy = true;
                    this.checkCreationStatus(body.CompanyName);
                },
                err => {
                    this.errorService.handle(err);
                }
            );
        });
    }

    private checkCreationStatus(companyName: string) {
        this.initService.getCompanies().subscribe(
            companies => {
                const nameLowerCase = companyName.toLowerCase();
                const company = (companies || []).find(c => {
                    return (c.Name || '').toLowerCase() === nameLowerCase;
                });

                if (company) {
                    this.busy = false;
                    this.authService.setActiveCompany(company, '/contract-activation');
                } else {
                    setTimeout(() => this.checkCreationStatus(companyName), 3000);
                }
            },
            () => setTimeout(() => this.checkCreationStatus(companyName), 3000)
        );
    }

    private getCorrectTemplate(templates) {
        const filteredTemplates = (templates || []).filter(template => {
            if (template.IsTest) {
                return false;
            }

            const name = template.Name;
            if (this.isEnk && name.includes('MAL AS')) {
                return false;
            }

            if (!this.isEnk && name.includes('MAL ENK')) {
                return false;
            }

            if (this.includeVat && name.includes('uten mva')) {
                return false;
            }

            if (!this.includeVat && name.includes('med mva')) {
                return false;
            }

            if (this.includeSalary && name.includes('uten lønn')) {
                return false;
            }

            if (!this.includeSalary && name.includes('med lønn')) {
                return false;
            }

            return true;
        });

        return filteredTemplates[0];
    }
}
