import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './authService';
import {CompanyService} from '@app/services/services';
import {Company} from '@app/unientities';

@Injectable()
export class CompanyKeyRouteGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private companyService: CompanyService,
    ) {}

    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (next.queryParamMap.has('companyKey')) {
            const key = next.queryParamMap.get('companyKey');
            return this.companyService.GetAll().map(companies => {
                const newCompany = companies && companies.find(c => c.Key === key);
                const currentCompany: Company = this.authService.activeCompany;
                if (newCompany && newCompany.Key !== currentCompany.Key) {
                    setTimeout(() => this.authService.setActiveCompany(newCompany, state.url));
                }
                return true;
            });
        }
        return true;
    }
}
