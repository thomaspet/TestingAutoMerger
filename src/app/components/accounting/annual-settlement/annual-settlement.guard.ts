import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';

@Injectable()
export class CompanyAllowedByTypeGuard implements CanDeactivate<any> {
    constructor(private annualSettlementService: AnnualSettlementService) {
    }
    public canDeactivate(component, currentRoute, currentState, nextState) {
        return this.annualSettlementService.checkIfCompanyIsAllowedByType();
    }

    canActivate() {
        return this.annualSettlementService.checkIfCompanyIsAllowedByType();
    }
}
