import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {SalarybalanceService, ErrorService} from '../../../../services/services';
import {SalaryBalance} from '../../../../unientities';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';

@Injectable()
export class SalaryBalanceViewService {

    constructor(
        private salaryBalanceService: SalarybalanceService,
        private errorService: ErrorService,
        private router: Router
    ) {}

    public setupSearchConfig(salaryBalance: SalaryBalance): IToolbarSearchConfig {
        return {
            lookupFunction: (query) => this.salaryBalanceService.GetAll(
                `filter=ID ne ${salaryBalance.ID} and (startswith(ID, '${query}') `
                + `or contains(Name, '${query}'))`
                + `&top=50&hateoas=false`
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item: SalaryBalance) => `${item.ID} - `
                + `${item.Name}`,
            initValue: (!salaryBalance || !salaryBalance.ID)
                ? 'Nytt forskudd/trekk'
                : `${salaryBalance.ID} - ${salaryBalance.Name || 'Forskudd/Trekk'}`,
            onSelect: selected => this.router.navigate(['salary/wagetypes/' + selected.ID])
        };
    }
}
