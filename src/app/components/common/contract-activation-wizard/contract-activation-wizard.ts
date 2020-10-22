import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {theme, THEMES} from 'src/themes/theme';
import {ElsaContractService, ErrorService} from '@app/services/services';

import {environment} from 'src/environments/environment';
import {ElsaCustomer} from '@app/models';
import {AuthService} from '@app/authService';

@Component({
    selector: 'contract-activation-wizard',
    templateUrl: './contract-activation-wizard.html',
    styleUrls: ['./contract-activation-wizard.sass']
})
export class ContractActivationWizard {
    @Input() contractID: number;
    @Input() companyName: string;
    @Input() orgNumber: string;
    @Input() contractType: number;
    @Input() customer: ElsaCustomer;
    @Output() contractActivated = new EventEmitter();
    @Output() back = new EventEmitter();

    activationInProgress: boolean;

    termsAgreed = false;

    bankName: string;
    headerText = theme.theme === THEMES.SR ? 'Bestill Bank+Regnskap' : 'Kontaktinformasjon';
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
        private elsaContractService: ElsaContractService,
        private authService: AuthService,
    ) {
        if (theme.theme === THEMES.SR) {
            this.customerDetailsForm.addControl('PersonalNumber', new FormControl('', Validators.required));
            this.customerDetailsForm.addControl('IsBankCustomer', new FormControl(false));
            this.bankName = this.authService.publicSettings?.BankName || 'SpareBank 1';
        } else if (theme.theme === THEMES.EXT02) {
            this.customerDetailsForm.addControl('BankUserID', new FormControl(''));
        }
    }

    ngOnChanges(changes) {
        if (changes['contractID'] && this.customer) {
            this.customerDetailsForm.patchValue(this.customer);
        }
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
            this.contractType
        ).subscribe(
            () => {
                if (customerDetails?.IsBankCustomer === false && this.authService.publicSettings?.BankCustomerUrl) {
                    let url = this.authService.publicSettings.BankCustomerUrl;
                    if (this.orgNumber) {
                        url += `?bm-orgNumber=${this.orgNumber}`;
                    }
                    window.open(url, '_blank');
                }
                this.contractActivated.emit();
            },
            err => {
                this.errorService.handle(err);
                this.activationInProgress = false;
                this.customerDetailsForm.enable();
            }
        );
    }
}
