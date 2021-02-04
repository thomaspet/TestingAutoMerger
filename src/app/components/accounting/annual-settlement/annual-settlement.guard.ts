import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {Observable} from 'rxjs';

@Injectable()
export class CompanyAllowedByTypeGuard implements CanActivate {
    constructor(private annualSettlementService: AnnualSettlementService) {
    }
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.annualSettlementService.checkIfCompanyIsAllowedByType();
    }

    canActivate() {
        return this.annualSettlementService.checkIfCompanyIsAllowedByType();
    }
}
