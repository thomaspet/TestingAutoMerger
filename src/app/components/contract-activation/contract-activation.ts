import {Component, HostBinding} from '@angular/core';
import {take} from 'rxjs/operators';

import {AuthService} from '@app/authService';
import {TabService} from '../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'contract-activation',
    templateUrl: './contract-activation.html',
    styleUrls: ['./contract-activation.sass'],
})
export class ContractActivation {
    @HostBinding('class.overlay') trialExpired: boolean;

    contractID: number;
    canActivateContract: boolean;
    hasActiveContract = false;

    constructor(
        private authService: AuthService,
        private tabService: TabService,
    ) {
        this.tabService.addTab({
            name: 'Aktivering av kundeforhold',
            url: '/contract-activation',
        });

        this.authService.authentication$.pipe(take(1)).subscribe(auth => {
            this.trialExpired = auth && !auth.hasActiveContract;
            try {
                const license = auth.user.License;
                this.canActivateContract = license.CustomerAgreement.CanAgreeToLicense;

                if (this.canActivateContract) {
                    this.contractID = license.Company && license.Company.ContractID;

                    const hasAgreedToLicense = license.CustomerAgreement.HasAgreedToLicense;
                    const isDemoLicense = license.ContractType.TypeName === 'Demo';

                    this.hasActiveContract = !isDemoLicense && hasAgreedToLicense;
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    canDeactivate(routeToActivate: string) {
        if (this.trialExpired) {
            // Allow company change and logout to pass canDeactivate check
            return routeToActivate.includes('reload') || routeToActivate.includes('init');
        } else {
            return true;
        }
    }
}
