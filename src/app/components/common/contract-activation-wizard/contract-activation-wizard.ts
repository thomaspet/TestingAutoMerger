import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {theme, THEMES} from 'src/themes/theme';
import {ElsaContractService, ElsaCustomersService, ErrorService} from '@app/services/services';

import {forkJoin} from 'rxjs';
import {environment} from 'src/environments/environment';
import {ElsaContractType} from '@app/models';

@Component({
    selector: 'contract-activation-wizard',
    templateUrl: './contract-activation-wizard.html',
    styleUrls: ['./contract-activation-wizard.sass']
})
export class ContractActivationWizard {
    @Input() contractID: number;
    @Input() companyName: string;
    @Input() orgNumber: string;
    @Output() contractActivated = new EventEmitter();
    @Output() back = new EventEmitter();

    loadingData: boolean;
    activationInProgress: boolean;

    contractTypes: ElsaContractType[];

    selectedContractType: number;

    termsAgreed = false;

    headerText = theme.theme === THEMES.SR ? 'Bestill Bank+Regnskap' : 'Aktivering av kundeforhold';
    submitButtonText = theme.theme === THEMES.SR ? 'Bestill' : 'Aktiver kundeforhold';
    lisenceAgreementUrl = environment.LICENSE_AGREEMENT_URL;

    customerDetailsForm = new FormGroup({
        ContactPerson: new FormControl('', Validators.required),
        ContactEmail: new FormControl('', Validators.required),
        ContactPhone: new FormControl('', Validators.required),
        // PersonalNumber, IsBankCustomer and BankUserID added in constructor
    });

    constructor(
        private errorService: ErrorService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService,
    ) {
        if (theme.theme === THEMES.SR) {
            this.customerDetailsForm.addControl('PersonalNumber', new FormControl('', Validators.required));
            this.customerDetailsForm.addControl('IsBankCustomer', new FormControl(false));
        } else if (theme.theme === THEMES.EXT02) {
            this.customerDetailsForm.addControl('BankUserID', new FormControl(''));
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

    activateContract() {
        this.customerDetailsForm.markAllAsTouched();
        if (!this.customerDetailsForm.valid) {
            return;
        }

        this.activationInProgress = true;
        this.customerDetailsForm.disable();

        const customerDetails = this.customerDetailsForm.value;
        customerDetails.Name = this.companyName;
        customerDetails.OrgNumber = this.orgNumber;

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
