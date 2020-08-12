import {Component, ChangeDetectionStrategy} from '@angular/core';
import {AuthService} from '@app/authService';

@Component({
    selector: 'bruno-accounting-services',
    templateUrl: './bruno-accounting-services.html',
    styleUrls: ['./bruno-accounting-services.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrunoAccountingServicesWidget {
    hasMiniPackage: boolean;

    constructor(authService: AuthService) {
        const user = authService.currentUser;
        const contractType = user.License?.ContractType?.TypeName;
        this.hasMiniPackage = contractType?.toLowerCase() === 'mini';
    }

    orderAccountingHelp() {

    }
}
