import {Component, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {ModulusService, InitService, ErrorService, CompanyService} from '@app/services/services';
import {HttpClient} from '@angular/common/http';
import {map, takeUntil, finalize} from 'rxjs/operators';
import {get} from 'lodash';
import {theme, THEMES} from 'src/themes/theme';
import {AuthService} from '@app/authService';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {interval, of} from 'rxjs';

enum TaxMandatoryType {
    NotTaxMandatory = 1,
    FutureTaxMandatory = 2,
    TaxMandatory = 3,
}

@Component({
    selector: 'new-company-modal',
    templateUrl: './new-company-modal.html',
    styleUrls: ['./new-company-modal.sass']
})
export class NewCompanyModal implements IUniModal {
    @ViewChild('companyNameInput') companyNameInput: ElementRef<HTMLInputElement>;

    options: IModalOptions = {};
    onClose = new EventEmitter();

    isExt02Env = theme.theme === THEMES.EXT02;
    isUEEnv = theme.theme === THEMES.UE;
    busyCreatingCompany: boolean;
    companyCreationFailed: boolean;

    isEnk: boolean;
    createFromMal: boolean = false;
    templates = [];
    template;
    taxType = TaxMandatoryType;

    autocompleteOptions: AutocompleteOptions = {
        canClearValue: false,
        clearInputOnSelect: true,
        autofocus: true,
        displayField: 'navn',
        placeholder: 'Hent selskapsdetaljer fra brønnøysundregistrene',
        lookup: (value) => this.orgNumberLookup(value)
    };

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
        AccountNumber: new FormControl('', this.isExt02Env ? Validators.required : undefined),
        TaxMandatoryType: new FormControl(undefined, Validators.required),
        CreateFromMal: new FormControl(false, undefined),
        TemplateIncludeSalary: new FormControl(undefined, Validators.required),
    });

    config = {
        template: (item) => item ? `${item.Name}` : '',
        searchable: false,
        hideDeleteButton: true
    };

    currentStep = 1;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private modulusService: ModulusService,
        private initService: InitService,
        private errorService: ErrorService,
        private companyService: CompanyService,
    ) {
        this.companyService.GetAll().subscribe(companies => {
            this.templates = companies.filter(c => c.IsTemplate);
            if (this.templates.length) {
                this.templates.unshift({Name: 'Ikke valgt', Key: null});
            }
        });
    }

    ngOnDestroy() {

    }

    onTemplateChange(template) {
        this.template = template;
    }

    onStep1Submit() {
        if (!this.step1Form.get('Country').value) {
            this.step1Form.controls.Country.setValue('Norge');
        }
        if (!this.step1Form.get('CountryCode').value) {
            this.step1Form.controls.CountryCode.setValue('NO');
        }
        this.step1Form.markAllAsTouched();
        if (this.step1Form.valid) {
            this.currentStep = 2;
        }
    }

    onStep2Submit() {
        this.step2Form.markAllAsTouched();
        if (this.step2Form.valid || (this.createFromMal && this.template?.Key)) {
            this.createCompany();
        }
    }

    private createCompany() {
        const companyDetails = this.step1Form.value;
        const step2FormValue = this.step2Form.value;

        this.busyCreatingCompany = true;
        this.companyCreationFailed = false;

        const taxType = step2FormValue.TaxMandatoryType;
        const includeVat = taxType === this.taxType.TaxMandatory;
        companyDetails.TaxMandatoryType = taxType;

        const obs = (this.createFromMal && this.template?.Key)
            ? of(this.template)
            : this.initService.getCompanyTemplate(this.isEnk, includeVat, step2FormValue?.TemplateIncludeSalary);

        obs.subscribe(template => {
            if (step2FormValue.AccountNumber) {
                companyDetails.CompanyBankAccount = {
                    AccountNumber: step2FormValue.AccountNumber
                };
            }

            const body = {
                CompanyName: companyDetails.CompanyName,
                ContractID: this.options?.data?.contractID || this.authService.contractID,
                CompanySettings: companyDetails,
                TemplateCompanyKey: template?.Key,
                IsTest: false
            };

            this.initService.createCompany(body, this.options?.data?.contractType).subscribe(
                () => this.checkCompanyCreationStatus(body.CompanyName),
                err => {
                    this.errorService.handle(err);
                    this.companyCreationFailed = true;
                    this.busyCreatingCompany = false;
                }
            );
        });
    }

    private checkCompanyCreationStatus(companyName: string) {
        interval(3000).pipe(takeUntil(this.onClose)).subscribe(() => {
            this.initService.getCompanies().subscribe(
                companies => {
                    const nameLowerCase = companyName.toLowerCase();
                    const company = (companies || []).find(c => {
                        return (c.Name || '').toLowerCase() === nameLowerCase;
                    });

                    if (company) {
                        this.companyService.invalidateCache();
                        this.authService.setActiveCompany(company, '/');
                        this.onClose.emit();
                    }
                },
                () => {}
            );
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

    onBrRegCompanySelected(brRegCompany) {
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

}
