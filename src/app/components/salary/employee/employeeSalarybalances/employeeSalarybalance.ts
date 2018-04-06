import {Component, OnInit} from '@angular/core';
import {UniView} from '../../../../../framework/core/uniView';
import {Router, ActivatedRoute} from '@angular/router';
import {UniCacheService, SalaryBalanceLineService, SalarybalanceService, ErrorService} from '../../../../services/services';
import {SalaryBalance, SalBalDrawType, SalBalType} from '../../../../unientities';
import * as _ from 'lodash';
import {UniTable} from '@uni-framework/ui/unitable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SalarybalanceList} from '@app/components/salary/salarybalance/salaryBalanceList/salaryBalanceList';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';

const SALARYBALANCES_KEY = 'salarybalances';
const SAVE_TRIGGER_KEY = 'save';
const NEW_TRIGGER_KEY = 'new';
const SELECTED_KEY = '_rowSelected';

@Component({
    selector: 'employee-salarybalance',
    templateUrl: './employeeSalarybalance.html'
})
export class EmployeeSalarybalance extends UniView implements OnInit {
    private employeeID: number;
    private selectedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject(1);
    private salarybalances: SalaryBalance[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        protected cacheService: UniCacheService,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private salaryBalanceService: SalarybalanceService,
        private errorService: ErrorService,
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
            .subscribe(model => this.refreshSalaryBalances(model));
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
        this.selectedSalaryBalance$.next(salaryBal);
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

        if (prevSalBal.InstalmentType !== salarybalance.InstalmentType && salarybalance.InstalmentType) {
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
