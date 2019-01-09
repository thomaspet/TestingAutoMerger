import {Component} from '@angular/core';
import {ElsaCustomersService, ErrorService} from '@app/services/services';

@Component({
    selector: 'license-info',
    templateUrl: './license-info.html',
    styleUrls: ['./license-info.sass'],
    host: {'class': 'uni-redesign'}
})
export class LicenseInfo {
    licenseOwner;

    constructor(
        private elsaCustomerService: ElsaCustomersService,
        private errorService: ErrorService
    ) {
        this.elsaCustomerService.getLicenseOwner().subscribe(
            res => this.licenseOwner = res,
            err => this.errorService.handle(err)
        );
    }
}
