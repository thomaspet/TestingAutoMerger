import {Component} from '@angular/core';
import {UniView} from '../../../../../framework/core/uniView';
import {Router, ActivatedRoute} from '@angular/router';
import {UniCacheService} from '../../../../services/services';
import {SalaryBalance} from '../../../../unientities';
import * as _ from 'lodash';

const SALARYBALANCES_KEY = 'salarybalances';

@Component({
    selector: 'employee-salarybalance',
    templateUrl: './employeeSalarybalance.html'
})
export class EmployeeSalarybalance extends UniView {
    private employeeID: number;
    private salarybalance: SalaryBalance;
    private salarybalances: SalaryBalance[] = [];

    constructor(
        router: Router,
        route: ActivatedRoute,
        cacheService: UniCacheService
    ) {
        super(router.url, cacheService);

        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.salarybalances = [];
            this.employeeID = +paramsChange['id'];
            super.getStateSubject(SALARYBALANCES_KEY)
                .filter((salBal: SalaryBalance[]) => !salBal.some(x => {
                    if (!x.Transactions) {
                        return false;
                    }
                    return x.Transactions.some(trans => !!trans._createguid);
                }))
                .subscribe(model => this.refreshSalaryBalances(model));
        });
    }

    private refreshSalaryBalances(salaryBalances: SalaryBalance[]) {
        if (!this.salarybalance || !this.salarybalances) {
            return;
        }

        this.setSalarybalance(salaryBalances
            .find(salBal => salBal['_originalIndex'] === this.salarybalance['_originalIndex']));
        this.salarybalances = _.cloneDeep(salaryBalances);
    }

    public setSalarybalance(salaryBal: SalaryBalance) {
        this.salarybalance = _.cloneDeep(salaryBal);
    }

    private onSalarybalanceChange(salarybalance: SalaryBalance) {
        salarybalance['_isDirty'] = true;
        let index = 0;
        if (this.salarybalances && this.salarybalances.length > 0) {
            index = this.salarybalances.findIndex((salbal) => {
                if (!salbal.ID) {
                    return salbal['_createguid'] === salarybalance['_createguid'];
                }

                return salbal.ID === salarybalance.ID;
            });
        }

        this.salarybalances[index] = salarybalance;
        super.updateState(SALARYBALANCES_KEY, this.salarybalances, true);
    }
}
