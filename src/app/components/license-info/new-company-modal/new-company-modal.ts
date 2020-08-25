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
import {interval} from 'rxjs';

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
    busyCreatingCompany: boolean;
    companyCreationFailed: boolean;

    isEnk: boolean;

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
        TemplateIncludeVat: new FormControl(undefined, Validators.required),
        TemplateIncludeSalary: new FormControl(undefined, Validators.required),
    });

    currentStep = 1;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private modulusService: ModulusService,
        private initService: InitService,
        private errorService: ErrorService,
        private companyService: CompanyService,
    ) {}

    ngOnDestroy() {

    }

    onStep1Submit() {
        this.step1Form.markAllAsTouched();
        if (this.step1Form.valid) {
            this.currentStep = 2;
        }
    }

    onStep2Submit() {
        this.step2Form.markAllAsTouched();
        if (this.step2Form.valid) {
            this.createCompany();
        }
    }

    private createCompany() {
        const companyDetails = this.step1Form.value;
        const step2FormValue = this.step2Form.value;

        this.busyCreatingCompany = true;
        this.companyCreationFailed = false;

        this.initService.getCompanyTemplate(
            this.isEnk,
            step2FormValue?.TemplateIncludeVat,
            step2FormValue?.TemplateIncludeSalary
        ).subscribe(template => {
            if (step2FormValue.AccountNumber) {
                companyDetails.CompanyBankAccount = {
                    AccountNumber: step2FormValue.AccountNumber
                };
            }

            const body = {
                CompanyName: companyDetails.CompanyName,
                ContractID: this.options?.data?.contractID || this.authService.contractID,
                CompanySettings: companyDetails,
                TemplateCompanyKey: template && template.Key,
                IsTest: false
            };

            this.initService.createCompany(body).subscribe(
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
