import {Component, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import {UniView} from '../../../../../framework/core/uniView';
import {Router, ActivatedRoute} from '@angular/router';
import {UniCacheService, SalaryBalanceLineService, SalarybalanceService, ErrorService} from '../../../../services/services';
import {SalaryBalance} from '../../../../unientities';
import * as _ from 'lodash';
import {UniTable} from '@uni-framework/ui/unitable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SalarybalanceList} from '@app/components/salary/salarybalance/salaryBalanceList/salaryBalanceList';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

const SALARYBALANCES_KEY = 'salarybalances';

@Component({
    selector: 'employee-salarybalance',
    templateUrl: './employeeSalarybalance.html'
})
export class EmployeeSalarybalance extends UniView implements AfterViewInit, OnInit {
    @ViewChild(SalarybalanceList) public balanceListCmp: SalarybalanceList;
    private balanceListCmp$: ReplaySubject<SalarybalanceList> = new ReplaySubject(1);
    private employeeID: number;
    private salarybalance$: BehaviorSubject<SalaryBalance> = new BehaviorSubject(null);
    private selectedSalaryBalance$: ReplaySubject<SalaryBalance> = new ReplaySubject(1);
    private salarybalances: SalaryBalance[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        protected cacheService: UniCacheService,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private salaryBalanceService: SalarybalanceService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);
    }

    public ngOnInit() {
        this.salarybalance$
            .filter(salBal => !!salBal)
            .subscribe(salBal => this.selectedSalaryBalance$.next(salBal));

        this.route
            .parent
            .params
            .do((paramsChange) => {
                super.updateCacheKey(this.router.url);
                this.salarybalances = [];
                this.employeeID = +paramsChange['id'];
            })
            .switchMap(() => super.getStateSubject(SALARYBALANCES_KEY))
            .subscribe(model => this.refreshSalaryBalances(model));
    }

    public ngAfterViewInit() {
        this.balanceListCmp$.next(this.balanceListCmp);
    }

    private refreshSalaryBalances(salaryBalances: SalaryBalance[]) {
        if (!salaryBalances) { return; }
        this.salarybalances = _.cloneDeep(salaryBalances);
        this.salarybalance$
            .take(1)
            .map(salarybalance => {
                const selectedSalBal = salarybalance && salarybalance.EmployeeID === this.employeeID
                    ? salaryBalances.find(salBal => salBal.ID === salarybalance.ID
                        || salBal['_originalIndex'] === this.salarybalance$['_originalIndex'])
                    : salaryBalances[0];
                return selectedSalBal;
            })
            .filter(salBal => !!salBal)
            .subscribe(selectedSalBal => this.selectSalaryBalance(selectedSalBal));
    }

    public selectSalaryBalance(selectedSalBal: SalaryBalance) {
        this.balanceListCmp$
            .take(1)
            .subscribe(list => list.selectRow(selectedSalBal));
    }

    public addSalaryBalance(salaryBalance: SalaryBalance) {
        this.balanceListCmp$
            .take(1)
            .subscribe(list => list.addRow(salaryBalance));
    }

    public setSalarybalance(salaryBal: SalaryBalance) {

        Observable
            .of(salaryBal)
            .switchMap(salBal => {
                return !salBal.ID || (salBal.Transactions && salBal.Transactions.length)
                    ? Observable.of(salBal)
                    : this.salaryBalanceLineService
                        .GetAll(`filter=SalaryBalanceID eq ${salBal.ID}`, ['SalaryTransaction.payrollrun'])
                        .map(lines => {
                            salBal.Transactions = lines;
                            return salBal;
                        });
            })
            .subscribe(salBal => this.salarybalance$.next(salaryBal));
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

        this.salarybalances[index] = salarybalance;
        super.updateState(SALARYBALANCES_KEY, this.salarybalances, true);
    }

    public createSalaryBalance() {
        this.salaryBalanceService
            .GetNewEntity()
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map((salarybalance: SalaryBalance) => {
                salarybalance.EmployeeID = this.employeeID;
                salarybalance['_createguid'] = this.salaryBalanceService.getNewGuid();
                salarybalance.FromDate = new Date();
                return salarybalance;
            })
            .do(salBal => this.addSalaryBalance(salBal))
            .subscribe(salBal => this.salarybalances = [...this.salarybalances, salBal]);
    }
}
