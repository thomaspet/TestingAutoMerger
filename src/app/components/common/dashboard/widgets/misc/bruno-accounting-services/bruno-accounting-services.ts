import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'bruno-accounting-services',
    templateUrl: './bruno-accounting-services.html',
    styleUrls: ['./bruno-accounting-services.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrunoAccountingServicesWidget {

    constructor() {}

    orderCreditCard() {
        window.open('https://www.dnb.no/bedrift/konto-kort-og-betaling/kort.html', '_blank');
    }
}
