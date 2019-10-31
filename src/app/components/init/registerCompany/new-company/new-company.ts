import {Component, Input} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http';
import {ModulusService, ElsaProductService} from '@app/services/services';
import {AuthService} from '@app/authService';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {get} from 'lodash';
import {ElsaProduct} from '@app/models';

@Component({
    selector: 'init-new-company',
    templateUrl: './new-company.html',
    styleUrls: ['./new-company.sass']
})
export class NewCompany {
    @Input() contractID: number;

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

    autocompleteOptions: AutocompleteOptions;
    products: ElsaProduct[];
    templates: any[];
    selectedTemplate: any;

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        private uniHttp: UniHttp,
        private modulusService: ModulusService,
        private productService: ElsaProductService
    ) {
        this.autocompleteOptions = {
            canClearValue: false,
            autofocus: true,
            displayField: 'navn',
            placeholder: 'Søk på navn eller organisasjonsnummer',
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

        // this.productService.GetAll().subscribe(
        //     res => {
        //         this.products = (res || []).filter(product => {
        //             return product.ProductTypeName === 'Module' && product.IsPerUser;
        //         });

        //         console.log(this.products);
        //     },
        //     err => console.error(err)
        // );

        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('template-companies')
            .send()
            .map(res => res.body)
            .subscribe(
                res => this.templates = res || [],
                err => console.error(err)
            );
    }

    onCompanySelected(brRegCompany) {
        setTimeout(() => console.log(brRegCompany));
        if (!brRegCompany) {
            return;
        }

        this.company = {
            CompanyName: brRegCompany.navn,
            Address: get(brRegCompany, 'forretningsadresse.adresse[0]', ''),
            PostalCode: get(brRegCompany, 'forretningsadresse.postnummer'),
            City: get(brRegCompany, 'forretningsadresse.poststed'),
            Country: get(brRegCompany, 'forretningsadresse.land'),
            CountryCode: get(brRegCompany, 'forretningsadresse.landkode'),
            OrganizationNumber: brRegCompany.organisasjonsnummer,
        };
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
                        this.busy = false;
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
        if (!this.company) {
            return;
        }

        const body = {
            CompanyName: this.company.CompanyName,
            ContractID: this.contractID,
            CompanySettings: this.company,
            ProductNames: ['Sales'],
            TemplateCompanyKey: this.selectedTemplate ? this.selectedTemplate.Key : null,
        };

        this.busy = true;
        this.uniHttp
            .asPOST()
            .usingInitDomain()
            .withEndPoint('create-company')
            .withBody(body)
            .send()
            .map(res => res.body)
            .subscribe(
                () => {
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
                    this.busy = false;
                }
            );
    }
}
