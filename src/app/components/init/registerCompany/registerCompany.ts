import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import { AuthService } from '@app/authService';
import { FormGroup, FormControl } from '@angular/forms';
import { CompanySettings, Contract, Company } from '@uni-entities';
import { ModulusService } from '@app/services/services';
import { SignalRService } from '@app/services/common/signal-r.service';

export interface CompanyInfo {
    companySettings: CompanySettings;
    isTemplate: boolean;
    valid: boolean;
}

@Component({
    selector: 'uni-register-company',
    templateUrl: './registerCompany.html',
    styleUrls: ['./registerCompany.sass'],
})
export class RegisterCompany {
    brRegBaseUrl = 'https://data.brreg.no/enhetsregisteret/api/enheter/';

    formGroup: FormGroup;
    contractID: number;
    contracts: Contract[];
    templateCompanyKey: any;
    templates: any;
    chooseTemplate: boolean;
    testCompanyName = 'Demo';
    newCompany = false;
    testCompany = false;
    creatingCompany = false;
    isOrgNumberValid = true;

    companyInfo = <CompanyInfo>{
        companySettings: <CompanySettings>{ DefaultAddress: {} },
        isTemplate: false,
    };

    constructor(
        private uniHttp: UniHttp,
        private modulusService: ModulusService,
        private authService: AuthService,
        private signalRservice: SignalRService
    ) {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('contracts')
            .send()
            .map(res => res.body)
            .subscribe(
                (res: Contract[]) => {
                    if (res.length > 1) {
                        this.contracts = res;
                    } else {
                        this.contractID = res[0].ID;
                    }
                },
                err => console.error(err)
        );

        this.getTemplates();
    }

    registerTestCompany() {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('template-companies')
            .send()
            .map(res => res.body)
            .subscribe(
                res => {
                    this.templateCompanyKey = res;
                    console.log(this.templateCompanyKey);
                },
                err => console.error(err)
            );
    }

    registerNewCompany() {
        this.newCompany = true;

        this.formGroup = new FormGroup({
            companyName: new FormControl({
                value: this.companyInfo.companySettings.CompanyName,
                disabled: true,
            }),
            orgNumber: new FormControl({
                value: this.companyInfo.companySettings.OrganizationNumber,
                disabled: true,
            }),
            address: new FormControl({
                value: this.companyInfo.companySettings.DefaultAddress.AddressLine1,
                disabled: true,
            }),
            postalCode: new FormControl({
                value: this.companyInfo.companySettings.DefaultAddress.PostalCode,
                disabled: true,
            }),
            city: new FormControl({
                value: this.companyInfo.companySettings.DefaultAddress.City,
                disabled: true,
            }),
        });

        this.formGroup.controls['orgNumber'].valueChanges
            .distinctUntilChanged()
            .subscribe(orgNumber => {
                this.validateOrgNumber();
                if (orgNumber && this.isOrgNumberValid) {
                    const orgNumberTrimmed = orgNumber.replace(/\ /g, '');
                    this.uniHttp
                        .asGET()
                        .withBaseUrl(this.brRegBaseUrl)
                        .usingEmptyDomain()
                        .withEndPoint(orgNumberTrimmed)
                        .send()
                        .map(res => res.body)
                        .subscribe(
                            res => {
                                const brRegInfo = res;
                                if (brRegInfo) {
                                    this.formGroup.patchValue({
                                        companyName: brRegInfo.navn,
                                        address: brRegInfo.forretningsadresse.adresse[0],
                                        postalCode: brRegInfo.forretningsadresse.postnummer,
                                        city: brRegInfo.forretningsadresse.poststed,
                                    });
                                }
                            },
                            err => console.error(err)
                        );
                }
            });
    }

    checkIfCompanyIsCreated() {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .subscribe(
                res => {
                    const company = res.body;
                    if (!company || !company.length) {
                        setTimeout(() => {
                            this.checkIfCompanyIsCreated();
                        }, 3000);
                    } else {
                        this.creatingCompany = false;
                        this.authService.setActiveCompany(company[0], '/');
                    }
                },
                () => {
                    setTimeout(() => {
                        this.checkIfCompanyIsCreated();
                    }, 3000);
                }
            );
    }

    createCompany() {
        this.creatingCompany = true;
        this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint('create-company')
            .withBody({
                CompanyName: this.formGroup.controls['companyName'].value,
                CompanySettings: this.companyInfo.companySettings,
                ContractID: this.contractID,
                TemplateCompanyKey: this.templateCompanyKey,
            })
            .send()
            .map(res => res.body)
            .subscribe(
                (company: Company) => {
                    this.checkIfCompanyIsCreated();
                    /* this.signalRservice.pushMessage$.subscribe(companyDone => {
                        console.log(companyDone);
                        if (companyDone) {
                            console.log(companyDone);
                            this.creatingCompany = false;
                            this.checkIfCompanyIsCreated();
                        }
                    }); */
                },
                err => {
                    console.error(err);
                    this.creatingCompany = false;
                }
            );
    }

    createTestCompany() {
        this.creatingCompany = true;
        this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint('create-company')
            .withBody({
                CompanyName: this.testCompanyName,
                ContractID: this.contractID,
                TemplateCompanyKey: this.templateCompanyKey,
            })
            .send()
            .map(res => res.body)
            .subscribe(
                (company: Company) => {
                    this.checkIfCompanyIsCreated();
                    /* this.signalRservice.pushMessage$.subscribe(companyDone => {
                        console.log(companyDone);
                        if (companyDone) {
                            console.log(companyDone);
                            this.creatingCompany = false;
                            this.checkIfCompanyIsCreated();
                        }
                    }); */
                },
                err => {
                    console.error(err);
                    this.creatingCompany = false;
                }
            );
    }

    getTemplates() {
        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('template-companies')
            .send()
            .map(res => res.body)
            .subscribe(
                res => {
                    this.templates = res;
                },
                err => console.error(err)
            );
    }

    validateOrgNumber() {
        const orgNumber = (
            this.formGroup.controls['orgNumber'].value || ''
        ).replace(/\ /g, '');
        if (orgNumber) {
            this.isOrgNumberValid = this.modulusService.isValidOrgNr(orgNumber);
        } else {
            this.isOrgNumberValid = true;
        }
    }

    logout() {
        this.authService.userManager.signoutRedirect();
    }
}
