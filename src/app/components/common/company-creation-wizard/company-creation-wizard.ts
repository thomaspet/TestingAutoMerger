import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {AuthService} from '@app/authService';
import {ModulusService, InitService, ErrorService, CompanyService} from '@app/services/services';
import {map, catchError} from 'rxjs/operators';
import {get} from 'lodash';
import {of} from 'rxjs';

@Component({
    selector: 'company-creation-wizard',
    templateUrl: './company-creation-wizard.html',
    styleUrls: ['./company-creation-wizard.sass']
})
export class CompanyCreationWizard {
    @ViewChild('companyNameInput') companyNameInput: ElementRef<HTMLInputElement>;

    @Input() contractID: number;
    @Input() orgNumber: string;
    @Input() createDemoCompany: boolean;

    busyCreatingCompany: boolean;
    autocompleteOptions: AutocompleteOptions;

    companyDetailsForm = new FormGroup({
        CompanyName: new FormControl('', Validators.required),
        Address: new FormControl('', Validators.required),
        PostalCode: new FormControl('', Validators.required),
        City: new FormControl('', Validators.required),
        Country: new FormControl('', Validators.required),
        CountryCode: new FormControl('', Validators.required),
        OrganizationNumber: new FormControl('', Validators.required),
    });

    isEnk: boolean;
    templateIncludeSalary: boolean;
    templateIncludeVat: boolean;

    currentStep = 0;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private modulusService: ModulusService,
        private initService: InitService,
        private errorService: ErrorService,
        private companyService: CompanyService,
    ) {
        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: true,
            autofocus: true,
            displayField: 'navn',
            placeholder: 'Hent selskapsdetaljer fra brønnøysundregistrene',
            lookup: (value) => this.orgNumberLookup(value)
        };
    }

    ngOnChanges(changes) {
        if (changes['orgNumber'] && this.orgNumber) {
            this.orgNumberLookup(this.orgNumber).subscribe(res => {
                if (res && res[0]) {
                    this.onBrRegCompanyChange(res[0]);
                }
            });
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

    next() {
        this.companyDetailsForm.markAllAsTouched();
        if (this.companyDetailsForm.valid) {
            this.currentStep++;
        }
    }

    onBrRegCompanyChange(brRegCompany) {
        if (!brRegCompany) {
            return;
        }

        this.isEnk = get(brRegCompany, 'organisasjonsform.kode') === 'ENK';
        this.templateIncludeSalary = undefined;
        this.templateIncludeVat = undefined;

        this.companyDetailsForm.patchValue({
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


    createCompany() {
        const companyDetails = this.companyDetailsForm.value;
        this.busyCreatingCompany = true;
        this.companyDetailsForm.disable();

        this.getCompanyTemplate().subscribe(template => {
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
                    this.busyCreatingCompany = false;
                    this.companyDetailsForm.enable();
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
                    if (this.isEnk && name.includes('MAL AS')) {
                        return false;
                    }

                    if (!this.isEnk && name.includes('MAL ENK')) {
                        return false;
                    }

                    if (this.templateIncludeVat && name.includes('uten mva')) {
                        return false;
                    }

                    if (!this.templateIncludeVat && name.includes('med mva')) {
                        return false;
                    }

                    if (this.templateIncludeSalary && name.includes('uten lønn')) {
                        return false;
                    }

                    if (!this.templateIncludeSalary && name.includes('med lønn')) {
                        return false;
                    }

                    return true;
                });
            }),
            catchError(() => of(null))
        );
    }
}
