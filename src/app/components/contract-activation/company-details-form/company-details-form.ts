import {Component, Input, Output, EventEmitter} from '@angular/core';
import { AutocompleteOptions } from '@uni-framework/ui/autocomplete/autocomplete';
import { ModulusService, BusinessRelationService } from '@app/services/services';

export interface CompanyDetails {
    CompanyName?: string;
    OrganizationNumber?: string;
    Address?: string;
    PostalCode?: string;
    City?: string;
    Country?: string;
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
    ) {}

    ngOnInit() {
        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: true,
            displayField: 'navn',
            placeholder: 'Hent detaljer fra Brønnøysundregistrene',
            lookup: (input) => {
                const orgNumber = input.replace(/\ /g, '');
                const query = this.modulusService.isValidOrgNr(orgNumber) ? orgNumber : input;
                return this.brService.search(query);
            }
        };
    }

    onBrRegItemSelected(item) {
        if (!item) {
            return;
        }

        const details = this.details;
        details.CompanyName = item.navn;
        details.OrganizationNumber = item.orgnr;
        details.Address = item.forretningsadr;
        details.PostalCode = item.forradrpostnr;
        details.City = item.forradrpoststed;
        details.Country = item.forradrland;

        this.details = details;
        this.detailsChange.emit(this.details);
    }
}
