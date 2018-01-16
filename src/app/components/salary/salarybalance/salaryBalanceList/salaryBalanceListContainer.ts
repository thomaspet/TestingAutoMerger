import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {SalarybalanceService, ErrorService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SalaryBalance, SalBalDrawType} from '@uni-entities';

@Component({
    selector: 'salary-balances-container',
    templateUrl: './salaryBalanceListContainer.html'
})

export class SalaryBalanceListContainer implements OnInit {
    public salaryBalances$: BehaviorSubject<SalaryBalance[]> = new BehaviorSubject([]);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tabSer: TabService,
        private salarybalanceService: SalarybalanceService,
        private errorService: ErrorService,
    ) {}

    public ngOnInit() {
        this.route
            .params
            .map(params => +params['empID'] || 0)
            .subscribe(empID => this.getSalaryBalances(empID));
    }

    private handleTab(empID: number) {
        this.tabSer
            .addTab({
                name: 'Saldo',
                url: 'salary/salarybalances' + (empID ? `;empID=${empID}` : ''),
                moduleID: UniModules.Salarybalances,
                active: true
            });
    }

    private getSalaryBalances(empID: number) {
        this.salarybalanceService
            .getAll(empID, ['Employee.BusinessRelationInfo'])
            .map(salaryBalances => this.sortList(salaryBalances))
            .subscribe(salaryBalances => this.salaryBalances$.next(salaryBalances));
    }

    private sortList(salaryBalances: SalaryBalance[]): SalaryBalance[] {
        return salaryBalances
            .sort((salBal1, salBal2) => this.getSortingValue(salBal2) - this.getSortingValue(salBal1));
    }

    private getSortingValue(salaryBalance: SalaryBalance) {
        return Math.abs(salaryBalance.CalculatedBalance || 0)
            + (salaryBalance.Type === SalBalDrawType.FixedAmount ? 1 : 0);
    }

    public handleSelectRow(row: SalaryBalance) {
        this.router.navigateByUrl('/salary/salarybalances/' + row.ID);
    }

    public handleCreateSalaryBalance() {
        this.router.navigateByUrl('/salary/salarybalances/0');
    }
}
