import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {ReplaySubject} from 'rxjs';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import { UniView } from '@uni-framework/core/uniView';
import { SalaryBalance, SalBalType } from '@uni-entities';
import { Router, ActivatedRoute } from '@angular/router';
import { UniCacheService, SalarybalanceService } from '@app/services/services';

const SALARYBALANCES_KEY = 'salarybalances';
const SAVE_TRIGGER_KEY = 'save';
const NEW_TRIGGER_KEY = 'new';
const SELECTED_KEY = '_rowSelected';

@Component({
    selector: 'employee-salarybalance',
    templateUrl: './salary-balance.component.html'
})
export class SalaryBalanceComponent extends UniView implements OnInit {
    public employeeID: number;
    public selectedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject(1);
    public salarybalances: SalaryBalance[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        protected cacheService: UniCacheService,
        private salaryBalanceService: SalarybalanceService,
        private modalService: UniModalService
    ) {
        super(router.url, cacheService);
    }

    public ngOnInit() {

        this.route
            .parent
            .params
            .do((paramsChange) => {
                super.updateCacheKey(this.router.url);
                this.salarybalances = [];
                this.employeeID = +paramsChange['id'];
            })
            .switchMap(() => super.getStateSubject(SALARYBALANCES_KEY))
            .do(model => this.selectSalaryBalance(model))
            .map(salarybalances => this.sortList(salarybalances))
            .subscribe(model => this.refreshSalaryBalances(model));
    }

    private sortList(salaryBalances: SalaryBalance[]): SalaryBalance[] {
        return salaryBalances
            .sort((salBal1, salBal2) => salBal2.ID - salBal1.ID);
    }

    private refreshSalaryBalances(salaryBalances: SalaryBalance[]) {
        if (!salaryBalances) {
            return;
        }
        this.salarybalances = _.cloneDeep(salaryBalances);
    }

    public onUpdatedList(salaryBalances: SalaryBalance[]) {
        super.updateState(SALARYBALANCES_KEY, salaryBalances, salaryBalances.some(x => x['_isDirty'] || x['Deleted']));
    }

    public setSalarybalance(salaryBal: SalaryBalance) {
        if (!salaryBal) {
            return;
        }
        this.selectedSalaryBalance$.next({...salaryBal});
    }

    private selectSalaryBalance(salaryBalances: SalaryBalance[]) {
        if (!salaryBalances.length) {
            return;
        }
        this.setSalarybalance(salaryBalances.find(salBal => salBal[SELECTED_KEY]));
    }

    public onSalarybalanceChange(salarybalance: SalaryBalance) {
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

        const prevSalBal = this.salarybalances[index];

        if (prevSalBal && prevSalBal.InstalmentType !== salarybalance.InstalmentType && salarybalance.InstalmentType) {
            salarybalance.Name = this.salaryBalanceService.getInstalmentTypes().find(type => type.ID === salarybalance.InstalmentType).Name;
        }

        this.salarybalances[index] = _.cloneDeep(salarybalance);
        super.updateState(SALARYBALANCES_KEY, this.salarybalances, true);
    }

    public createSalaryBalance() {
        if (!this.salarybalances.some(x => !x.ID && x.InstalmentType === SalBalType.Advance)) {
            super.updateState(NEW_TRIGGER_KEY, SalaryBalance, false);
            return;
        }
        this.modalService
            .confirm({
                message: 'Du har et ulagret forskudd. Du må lagre før du kan opprette nytt trekk/forskudd',
                buttonLabels: {
                    accept: 'Lagre',
                    cancel: 'Avbryt'
                }
            })
            .onClose
            .filter((result: ConfirmActions) => result === ConfirmActions.ACCEPT)
            .subscribe(() => super.updateState(SAVE_TRIGGER_KEY, SalaryBalance, false));
    }
}
