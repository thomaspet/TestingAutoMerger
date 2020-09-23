import {Component, EventEmitter} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {BankIntegrationAgreement} from '@uni-entities';
import {AuthService} from '@app/authService';

@Component({
    selector: 'bruno-bank-onboarding-modal',
    templateUrl: './bruno-bank-onboarding-modal.html',
    styleUrls: ['./bruno-bank-onboarding-modal.sass']
})
export class BrunoBankOnboardingModal {
    options: IModalOptions = {};
    onClose = new EventEmitter();

    orderKID: boolean;
    agreement: BankIntegrationAgreement;
    bankIntegrationUserName: string;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.agreement = this.options?.data;
    }

    ngAfterViewInit() {
        this.bankIntegrationUserName = this.authService.currentUser.BankIntegrationUserName || '';
    }

    openExternalOnboarding() {
        let url = this.orderKID
            ? 'https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=Bruno&kontoinfoval=true&innbetalingerval=true&utbetalingerval=true'
            : 'https://www.dnb.no/bedrift/konto-kort-og-betaling/betaling/logginn-regnskap-client.html?erp=Bruno&kontoinfoval=true&utbetalingerval=true';

        if (this.bankIntegrationUserName) {
            url += `&userid=${this.bankIntegrationUserName}`
        }

        window.open(url, '_blank');

        this.onClose.emit(this.agreement);
    }
}
