import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {AuthService} from '@app/authService';
import {ModulusService, InitService, ErrorService, CompanyService, ElsaContractService} from '@app/services/services';
import {map} from 'rxjs/operators';
import {get} from 'lodash';
import {forkJoin} from 'rxjs';
import {THEMES, theme} from 'src/themes/theme';
import {ElsaContractType, ElsaContract} from '@app/models/elsa-models';

enum STEPS {
    CONTRACT_TYPE,
    COMPANY_STEP1,
    COMPANY_STEP2,
    CONTRACT_ACTIVATION,
}

@Component({
    selector: 'company-creation-wizard',
    templateUrl: './company-creation-wizard.html',
    styleUrls: ['./company-creation-wizard.sass']
})
export class CompanyCreationWizard {
    @ViewChild('companyNameInput') companyNameInput: ElementRef<HTMLInputElement>;

    @Input() contractID: number;
    @Input() includeContractActivation: boolean;
    @Input() createDemoCompany: boolean;

    contractActivated: boolean;
    isBrunoEnv = theme.theme === THEMES.EXT02;
    busyCreatingCompany: boolean;
    autocompleteOptions: AutocompleteOptions;
    contract: ElsaContract;
    contractTypes: ElsaContractType[];
    selectedContractType: number;

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

    STEPS = STEPS;
    currentStep: number;
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
    }

    ngOnChanges() {
        if (this.contractID) {
            if (this.createDemoCompany) {
                this.currentStep = STEPS.COMPANY_STEP1;
            } else {
                console.log('lookup');
                forkJoin([
                    this.elsaContractService.getAll(),
                    this.elsaContractService.getCustomContractTypes()
                ]).subscribe(
                    ([contracts, contractTypes]) => {
                        this.contract = contracts?.find(c => c.ID === this.contractID);
                        this.contractTypes = contractTypes || [];
                        this.currentStep = this.contractTypes.length ? STEPS.CONTRACT_TYPE : STEPS.COMPANY_STEP1;
                    },
                    err => console.error(err)
                );
            }
        }
    }

    onContractTypeSelected(type: ElsaContractType) {
        this.selectedContractType = type.ContractType;
        this.currentStep = STEPS.COMPANY_STEP1;
        if (this.contract?.Customer?.OrgNumber?.length) {
            this.orgNumberLookup(this.contract.Customer.OrgNumber).subscribe(
                res => this.onBrRegCompanyChange(res[0]),
                err => console.error(err)
            );
        }
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

    step1FormSubmit() {
        this.step1Form.markAllAsTouched();
        if (this.step1Form.valid) {
            this.currentStep = STEPS.COMPANY_STEP2;
        }
    }

    step2FormSubmit() {
        this.step2Form.markAllAsTouched();
        if (this.step2Form.valid) {
            if (this.includeContractActivation && !this.contractActivated) {
                const companyData = this.step1Form.value;
                this.orgNumber = companyData.OrganizationNumber;
                this.companyName = companyData.CompanyName;

                this.currentStep = STEPS.CONTRACT_ACTIVATION;
            } else {
                this.createCompany();
            }
        }
    }

    onContractActivated() {
        this.contractActivated = true;
        this.createCompany();
    }

    createCompany() {
        const companyDetails = this.step1Form.value;
        const step2FormDetails = this.step2Form.value;

        this.busyCreatingCompany = true;
        this.companyCreationFailed = false;

        const includeVat = this.step2Form.value?.TemplateIncludeVat;
        const includeSalary = this.step2Form.value?.TemplateIncludeSalary;

        this.initService.getCompanyTemplate(this.isEnk, includeVat, includeSalary).subscribe(template => {
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
                    this.currentStep = STEPS.COMPANY_STEP1;
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
}
