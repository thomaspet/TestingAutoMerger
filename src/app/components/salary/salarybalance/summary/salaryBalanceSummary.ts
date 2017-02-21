import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from 'unitable-ng2/main';
import { SalaryBalance, SalaryTransaction, Employee } from '../../../../unientities';
import { SalaryTransactionService, ErrorService, EmployeeService } from '../../../../services/services';

@Component({
    selector: 'salary-balance-summary',
    templateUrl: 'app/components/salary/salarybalance/summary/salaryBalanceSummary.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryBalanceSummary implements OnInit, OnChanges {

    @Input() private salaryBalance: SalaryBalance;
    private salaryTransactionsModel$: BehaviorSubject<SalaryTransaction[]>;
    private description$: BehaviorSubject<string>;
    private tableConfig: UniTableConfig;
    constructor(
        private salaryTransactionService: SalaryTransactionService,
        private errorService: ErrorService,
        private employeeService: EmployeeService) {
        this.salaryTransactionsModel$ = new BehaviorSubject<SalaryTransaction[]>([]);
        this.description$ = new BehaviorSubject<string>('');
    }

    public ngOnInit() {
        this.createConfig();
    }

    public ngOnChanges() {
        if (this.salaryBalance) {
            let transObs = this.salaryBalance.Transactions && this.salaryBalance.Transactions.length
                ? Observable.of(this.salaryBalance.Transactions)
                : this.salaryTransactionService
                    .GetAll(`filter=SalaryBalanceID eq ${this.salaryBalance.ID}`);
            transObs
                .subscribe(transes => this.salaryTransactionsModel$.next(transes),
                err => this.errorService.handle(err));

            let empObs = this.salaryBalance.Employee
                ? Observable.of(this.salaryBalance.Employee)
                : this.employeeService
                    .Get(this.salaryBalance.EmployeeID, ['BusinessRelationInfo']);

            empObs.subscribe(
                (emp: Employee) => this.description$
                    .next(`SaldoId nr ${this.salaryBalance.ID}, Ansattnr ${emp.EmployeeNumber} - ${emp.BusinessRelationInfo.Name}`),
                err => this.errorService.handle(err));
        } else {
            this.salaryTransactionsModel$.next([]);
            this.description$.next('');
        }
    }

    private createConfig() {
        const nameCol = new UniTableColumn('Text', 'Navn trekk', UniTableColumnType.Text);
        const startDateCol = new UniTableColumn('FromDate', 'Startdato', UniTableColumnType.LocalDate)
            .setWidth('7rem');
        const sumCol = new UniTableColumn('Sum', 'Beløp', UniTableColumnType.Money);
        const payRunCol = new UniTableColumn('PayrollRunID', 'Lønnsavregning', UniTableColumnType.Number)
            .setWidth('9rem');

        let columnList = [nameCol, startDateCol, sumCol, payRunCol];

        this.tableConfig = new UniTableConfig(false, false)
            .setColumns(columnList);
    }
}
