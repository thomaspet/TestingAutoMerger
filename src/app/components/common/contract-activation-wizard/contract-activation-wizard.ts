import {Component, Input, Output, EventEmitter} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {theme, THEMES} from 'src/themes/theme';
import {ModulusService, ElsaContractService, ElsaCustomersService, ErrorService} from '@app/services/services';
import {AutocompleteOptions} from '@uni-framework/ui/autocomplete/autocomplete';

import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {ElsaContractType} from '@app/models';

@Component({
    selector: 'contract-activation-wizard',
    templateUrl: './contract-activation-wizard.html',
    styleUrls: ['./contract-activation-wizard.sass']
})
export class ContractActivationWizard {
    @Input() contractID: number;
    @Output() contractActivated = new EventEmitter<string>();

    loadingData: boolean;
    activationInProgress: boolean;

    contractTypes: ElsaContractType[];

    selectedContractType: number;

    autocompleteOptions: AutocompleteOptions;
    termsAgreed = false;
    brRegCompany;

    headerText = theme.theme === THEMES.SR ? 'Bestill Bank+Regnskap' : 'Aktivering av kundeforhold';
    submitButtonText = theme.theme === THEMES.SR ? 'Bestill' : 'Aktiver kundeforhold';
    lisenceAgreementUrl = environment.LICENSE_AGREEMENT_URL;

    customerDetailsForm = new FormGroup({
        Name: new FormControl('', Validators.required),
        OrgNumber: new FormControl('', Validators.required),
        ContactPerson: new FormControl('', Validators.required),
        ContactEmail: new FormControl('', Validators.required),
        ContactPhone: new FormControl('', Validators.required),
        // PersonalNumber, IsBankCustomer and BankUserID added in constructor
    });

    constructor(
        private http: HttpClient,
        private errorService: ErrorService,
        private modulusService: ModulusService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService,
    ) {
        this.autocompleteOptions = {
            canClearValue: false,
            clearInputOnSelect: false,
            autofocus: true,
            displayField: 'navn',
            placeholder: '',
            lookup: (input) => {
                const orgNumber = input.replace(/\ /g, '');
                const query = this.modulusService.isValidOrgNr(orgNumber)
                    ? `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`
                    : `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURI(input)}`;

                return this.http.get(query).pipe(map(res => {
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

        if (theme.theme === THEMES.SR) {
            this.customerDetailsForm.addControl('PersonalNumber', new FormControl('', Validators.required));
            this.customerDetailsForm.addControl('IsBankCustomer', new FormControl(false));
        } else if (theme.theme === THEMES.EXT02) {
            this.customerDetailsForm.addControl('BankUserID', new FormControl('', Validators.required));
        }
    }

    ngOnChanges(changes) {
        if (changes['contractID'] && this.contractID) {
            this.loadingData = true;
            forkJoin(
                this.elsaContractService.getCustomContractTypes(),
                this.elsaCustomerService.getByContractID(this.contractID),
            ).subscribe(
                ([contractTypes, customer]) => {
                    this.contractTypes = contractTypes || [];
                    this.customerDetailsForm.patchValue(customer);
                    this.loadingData = false;
                },
                err => console.error(err)
            );
        }
    }

    onContractTypeSelected(type: ElsaContractType) {
        this.selectedContractType = type.ContractType;
    }

    onBrRegCompanyChange() {
        this.customerDetailsForm.patchValue({
            Name: this.brRegCompany?.navn || '',
            OrgNumber: this.brRegCompany?.organisasjonsnummer || ''
        });
    }

    activateContract() {
        this.customerDetailsForm.markAllAsTouched();
        if (!this.customerDetailsForm.valid) {
            return;
        }

        this.activationInProgress = true;
        this.customerDetailsForm.disable();

        const customerDetails = this.customerDetailsForm.value;

        this.elsaContractService.activate(
            this.contractID,
            customerDetails,
            this.selectedContractType
        ).subscribe(
            () => this.contractActivated.emit(customerDetails.OrgNumber),
            err => {
                this.errorService.handle(err);
                this.activationInProgress = false;
                this.customerDetailsForm.enable();
            }
        );
    }
}
