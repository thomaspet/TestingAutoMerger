import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from '@app/authService';

@Injectable()
export class LicenseInfoGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        // true if they are license admin on current license,
        // or if they have selected a different contract, which means they are license admin on a different license
        if (this.authService.currentUser.License?.CustomerAgreement?.CanAgreeToLicense || sessionStorage.getItem('selectedContractID')) {
            return true;
        }
        this.router.navigateByUrl('/license-info/details');
        return false;
    }
}
