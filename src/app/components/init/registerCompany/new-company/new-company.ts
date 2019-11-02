import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {ModulusService, ErrorService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {get} from 'lodash';
import {ElsaProduct} from '@app/models';
import {InitService} from '@app/services/services';
import {Router} from '@angular/router';
import {SignalRService} from '@app/services/common/signal-r.service';

@Component({
    selector: 'init-new-company',
    templateUrl: './new-company.html',
    styleUrls: ['./new-company.sass']
})
export class NewCompany {
    @ViewChild('companyNameInput') companyNameInput: ElementRef;
    @Input() contractID: number;

    creatingCompany: boolean;
    busy: boolean;
    company: {
        CompanyName: string;
        OrganizationNumber: string;
        Address: string;
        PostalCode: string;
        City: string;
        CountryCode: string;
        Country: string;
    };

    step = 1;
    autocompleteOptions: AutocompleteOptions;
    products: ElsaProduct[];
    templates: any[];
    selectedTemplate: any;

    isEnk: boolean;
    includeVat: boolean;
    includeSalary: boolean;

    constructor(
        private signalRService: SignalRService,
        private router: Router,
        private errorService: ErrorService,
        private initService: InitService,
        private httpClient: HttpClient,
        private authService: AuthService,
        private modulusService: ModulusService,
    ) {
        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: true,
            autofocus: true,
            displayField: 'navn',
            placeholder: 'Søk på firmanavn eller organisasjonsnummer',
            lookup: (input) => {
                const orgNumber = input.replace(/\ /g, '');
                const query = this.modulusService.isValidOrgNr(orgNumber)
                    ? `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`
                    : `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURI(input)}`;

                return this.httpClient.get(query).pipe(map(res => {
                    if (res['_embedded'] && res['_embedded'].enheter) {
                        return res['_embedded'].enheter;
                    } else if (res['organisasjonsnummer']) {
                        return [res];
                    } else {
                        return [];
                    }
                }));
            }
        };
    }

    goBack() {
        if (this.step === 2) {
            this.step = 1;
        } else {
            this.router.navigateByUrl('/init/register-company');
        }
    }

    onCompanySelected(brRegCompany) {
        setTimeout(() => console.log(brRegCompany));
        if (!brRegCompany) {
            return;
        }

        this.isEnk = get(brRegCompany, 'organisasjonsform.kode') === 'ENK';
        this.includeSalary = undefined;
        this.includeVat = undefined;

        this.company = {
            CompanyName: brRegCompany.navn,
            Address: get(brRegCompany, 'forretningsadresse.adresse[0]', ''),
            PostalCode: get(brRegCompany, 'forretningsadresse.postnummer'),
            City: get(brRegCompany, 'forretningsadresse.poststed'),
            Country: get(brRegCompany, 'forretningsadresse.land'),
            CountryCode: get(brRegCompany, 'forretningsadresse.landkode'),
            OrganizationNumber: brRegCompany.organisasjonsnummer,
        };

        setTimeout(() => {
            try {
                this.companyNameInput.nativeElement.focus();
                this.companyNameInput.nativeElement.select();
            } catch (e) {}
        });
    }

    createCompany() {
        if (!this.company) {
            return;
        }

        this.busy = true;
        this.initService.getTemplates().subscribe(templates => {
            if (!templates || !templates.length) {
                // TODO: do we need to abort here?
            }

            const filteredTemplates = templates.filter(template => {
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

            const body = {
                CompanyName: this.company.CompanyName,
                ContractID: this.contractID,
                CompanySettings: this.company,
                ProductNames: 'SrBundle',
                TemplateCompanyKey: filteredTemplates[0] && filteredTemplates[0].Key
            };

            this.initService.createCompany(body).subscribe(
                () => {
                    this.signalRService.pushMessage$.subscribe(message => {
                        console.log('==== SIGNAL R ====');
                        console.log(message);
                        console.log('==================');
                    });

                    this.busy = false;
                    this.creatingCompany = true;
                    this.checkCreationStatus();
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        });
    }

    private checkCreationStatus() {
        this.initService.getCompanies().subscribe(
            companies => {
                if (companies && companies.length) {
                    this.busy = false;
                    this.authService.setActiveCompany(companies[0], '/');
                } else {
                    setTimeout(() => this.checkCreationStatus(), 3000);
                }
            },
            () => setTimeout(() => this.checkCreationStatus(), 3000)
        );
    }
}
