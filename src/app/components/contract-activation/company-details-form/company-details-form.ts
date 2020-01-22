import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';
import {ModulusService, BusinessRelationService} from '@app/services/services';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {get} from 'lodash';

export interface CompanyDetails {
    CompanyName?: string;
    OrganizationNumber?: string;
    Address?: string;
    PostalCode?: string;
    City?: string;
    Country?: string;
    CountryCode?: string;
}

@Component({
    selector: 'company-details-form',
    templateUrl: './company-details-form.html'
})
export class CompanyDetailsForm {
    @Input() details: CompanyDetails;
    @Output() detailsChange = new EventEmitter<CompanyDetails>();

    autocompleteOptions: AutocompleteOptions;

    constructor(
        private modulusService: ModulusService,
        private brService: BusinessRelationService,
        private httpClient: HttpClient
    ) {}

    ngOnInit() {
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

        const details = this.details;
        // details.CompanyName = item.navn;
        // details.OrganizationNumber = item.orgnr;
        // details.Address = item.forretningsadr;
        // details.PostalCode = item.forradrpostnr;
        // details.City = item.forradrpoststed;
        // details.Country = item.forradrland;

        details.CompanyName = item.navn,
        details.Address = get(item, 'forretningsadresse.adresse[0]', ''),
        details.PostalCode = get(item, 'forretningsadresse.postnummer'),
        details.City = get(item, 'forretningsadresse.poststed'),
        details.Country = get(item, 'forretningsadresse.land'),
        details.CountryCode = get(item, 'forretningsadresse.landkode'),
        details.OrganizationNumber = item.organisasjonsnummer,

        this.details = details;
        this.detailsChange.emit(this.details);
    }
}
