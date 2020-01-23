import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {ModulusService, BusinessRelationService, CompanyTypeService} from '@app/services/services';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {get} from 'lodash';
import {CompanyType} from '@uni-entities';
import {ISelectConfig} from '@uni-framework/ui/uni-select/select';

export interface CompanyDetails {
    CompanyName?: string;
    OrganizationNumber?: string;
    Address?: string;
    PostalCode?: string;
    City?: string;
    Country?: string;
    CountryCode?: string;
    CompanyTypeID?: number;
}

@Component({
    selector: 'company-details-form',
    templateUrl: './company-details-form.html'
})
export class CompanyDetailsForm {
    @Input() details: CompanyDetails;
    @Output() detailsChange = new EventEmitter<CompanyDetails>();

    companyTypes: Array<CompanyType> = [];
    companyTypesConfig: ISelectConfig;
    autocompleteOptions: AutocompleteOptions;

    constructor(
        private modulusService: ModulusService,
        private brService: BusinessRelationService,
        private httpClient: HttpClient,
        private companyTypeService: CompanyTypeService,
    ) {}

    ngOnInit() {
        this.companyTypeService.GetAll(null).subscribe(companyTypes => {
            this.companyTypes = companyTypes;
        });

        this.companyTypesConfig = {
            valueProperty: 'ID',
            displayProperty: 'FullName',
            searchable: true,
            placeholder: 'Firmatype'
        };

        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: true,
            displayField: 'navn',
            placeholder: 'Hent detaljer fra Brønnøysundregistrene',
            lookup: (input) => {
                const orgNumber = input.replace(/\ /g, '');
                // const query = this.modulusService.isValidOrgNr(orgNumber) ? orgNumber : input;
                // return this.brService.search(query);

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

    onBrRegItemSelected(item) {
        if (!item) {
            return;
        }

        this.details.CompanyName = item.navn,
        this.details.Address = get(item, 'forretningsadresse.adresse[0]', ''),
        this.details.PostalCode = get(item, 'forretningsadresse.postnummer'),
        this.details.City = get(item, 'forretningsadresse.poststed'),
        this.details.Country = get(item, 'forretningsadresse.land'),
        this.details.CountryCode = get(item, 'forretningsadresse.landkode'),
        this.details.OrganizationNumber = item.organisasjonsnummer,

        this.detailsChange.emit(this.details);
    }

    public onCompanyTypeSelect(companyType) {
        this.details.CompanyTypeID = companyType && companyType.ID || null;
        this.detailsChange.emit(this.details);
    }
}
