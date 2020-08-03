import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {AuthService} from '@app/authService';
import {ModulusService, InitService, ErrorService, CompanyService, ElsaContractService} from '@app/services/services';
import {map, catchError} from 'rxjs/operators';
import {get} from 'lodash';
import {of, Subscription} from 'rxjs';
import {THEMES, theme} from 'src/themes/theme';

@Component({
    selector: 'company-creation-wizard',
    templateUrl: './company-creation-wizard.html',
    styleUrls: ['./company-creation-wizard.sass']
})
export class CompanyCreationWizard {
    @ViewChild('companyNameInput') companyNameInput: ElementRef<HTMLInputElement>;

    @Input() contractID: number;
    @Input() createDemoCompany: boolean;
    @Input() includeContractActivation: boolean;

    contractActivated: boolean;
    isBrunoEnv = theme.theme === THEMES.EXT02;
    busyCreatingCompany: boolean;
    autocompleteOptions: AutocompleteOptions;

    step1Form = new FormGroup({
        CompanyName: new FormControl('', Validators.required),
        Address: new FormControl('', Validators.required),
        PostalCode: new FormControl('', Validators.required),
        City: new FormControl('', Validators.required),
        Country: new FormControl('', Validators.required),
        CountryCode: new FormControl('', Validators.required),
        OrganizationNumber: new FormControl('', Validators.required),
    });

    step2Form = new FormGroup({
        // AccountNumber added in constructor (needs env check)
        TemplateIncludeSalary: new FormControl(undefined, Validators.required),
        TemplateIncludeVat: new FormControl(undefined, Validators.required),
    });

    isEnk: boolean;
    companyName: string;
    orgNumber: string;

    currentStep = 1;
    contractActivationVisible = false;
    companyCreationFailed = false;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private modulusService: ModulusService,
        private initService: InitService,
        private errorService: ErrorService,
        private companyService: CompanyService,
        private elsaContractService: ElsaContractService,
    ) {
        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: true,
            autofocus: true,
            displayField: 'navn',
            placeholder: 'Hent selskapsdetaljer fra brønnøysundregistrene',
            lookup: (value) => this.orgNumberLookup(value)
        };

        if (this.isBrunoEnv) {
            this.step2Form.addControl('AccountNumber', new FormControl('', Validators.required));
        }

        this.elsaContractService.getAll().subscribe(contracts => {
            const contract = contracts && contracts[0];
            if (contract?.Customer?.OrgNumber?.length) {
                this.orgNumberLookup(contract.Customer.OrgNumber).subscribe(
                    res => this.onBrRegCompanyChange(res[0]),
                    err => console.error(err)
                );
            }
        });
    }

    private orgNumberLookup(query) {
        const orgNumber = query.replace(/\ /g, '');
        const url = this.modulusService.isValidOrgNr(orgNumber)
            ? `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`
            : `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURI(query)}`;

        return this.http.get(url).pipe(map(res => {
            if (res['_embedded'] && res['_embedded'].enheter) {
                return res['_embedded'].enheter;
            } else if (res['organisasjonsnummer']) {
                return [res];
            } else {
                return [];
            }
        }));
    }

    onBrRegCompanyChange(brRegCompany) {
        if (!brRegCompany) {
            return;
        }

        this.isEnk = get(brRegCompany, 'organisasjonsform.kode') === 'ENK';

        this.step1Form.patchValue({
            CompanyName: brRegCompany.navn,
            Address: get(brRegCompany, 'forretningsadresse.adresse[0]', ''),
            PostalCode: get(brRegCompany, 'forretningsadresse.postnummer'),
            City: get(brRegCompany, 'forretningsadresse.poststed'),
            Country: get(brRegCompany, 'forretningsadresse.land'),
            CountryCode: get(brRegCompany, 'forretningsadresse.landkode'),
            OrganizationNumber: brRegCompany.organisasjonsnummer,
        });

        setTimeout(() => this.companyNameInput?.nativeElement?.focus());
    }

    next() {
        this.step1Form.markAllAsTouched();
        if (this.step1Form.valid) {
            this.currentStep++;
        }
    }

    onCompanyFormSubmit() {
        if (this.includeContractActivation && !this.contractActivated) {
            const companyData = this.step1Form.value;
            this.orgNumber = companyData.OrganizationNumber;
            this.companyName = companyData.CompanyName;

            this.contractActivationVisible = true;
        } else {
            this.createCompany();
        }
    }

    onContractActivated() {
        this.contractActivated = true;
        this.contractActivationVisible = false;
        this.createCompany();
    }

    createCompany() {
        const companyDetails = this.step1Form.value;
        const step2FormDetails = this.step2Form.value;

        this.busyCreatingCompany = true;
        this.companyCreationFailed = false;

        this.getCompanyTemplate().subscribe(template => {
            const companySettings = companyDetails;
            if (step2FormDetails.AccountNumber) {
                companySettings.CompanyBankAccount = {
                    AccountNumber: step2FormDetails.AccountNumber
                };
            }

            const body = {
                CompanyName: companyDetails.CompanyName,
                ContractID: this.contractID,
                CompanySettings: companyDetails,
                TemplateCompanyKey: template && template.Key,
                IsTest: !!this.createDemoCompany
            };

            this.initService.createCompany(body).subscribe(
                () => this.checkCompanyCreationStatus(body.CompanyName),
                err => {
                    this.errorService.handle(err);
                    this.currentStep = 1;
                    this.companyCreationFailed = true;
                    this.busyCreatingCompany = false;
                }
            );
        });
    }

    private checkCompanyCreationStatus(companyName: string) {
        this.initService.getCompanies().subscribe(
            companies => {
                const nameLowerCase = companyName.toLowerCase();
                const company = (companies || []).find(c => {
                    return (c.Name || '').toLowerCase() === nameLowerCase;
                });

                if (company) {
                    this.busyCreatingCompany = false;
                    this.companyService.invalidateCache();
                    this.authService.setActiveCompany(company, '/');
                } else {
                    setTimeout(() => this.checkCompanyCreationStatus(companyName), 3000);
                }
            },
            () => setTimeout(() => this.checkCompanyCreationStatus(companyName), 3000)
        );
    }


    private getCompanyTemplate() {
        return this.initService.getTemplates().pipe(
            map(templates => {
                return (templates || []).find(template => {
                    if (template.IsTest) {
                        return false;
                    }

                    const name = template.Name || '';
                    const includeVat = this.step2Form.value?.TemplateIncludeVat;
                    const includeSalary = this.step2Form.value?.TemplateIncludeSalary;

                    if (this.isEnk && name.includes('MAL AS')) {
                        return false;
                    }

                    if (!this.isEnk && name.includes('MAL ENK')) {
                        return false;
                    }

                    if (includeVat && name.includes('uten mva')) {
                        return false;
                    }

                    if (!includeVat && name.includes('med mva')) {
                        return false;
                    }

                    if (includeSalary && name.includes('uten lønn')) {
                        return false;
                    }

                    if (!includeSalary && name.includes('med lønn')) {
                        return false;
                    }

                    return true;
                });
            }),
            catchError(() => of(null))
        );
    }
}
