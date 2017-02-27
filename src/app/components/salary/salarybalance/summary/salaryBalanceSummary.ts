import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from 'unitable-ng2/main';
import { SalaryBalance, SalaryTransaction, Employee } from '../../../../unientities';
import { SalaryBalanceLineService, ErrorService, EmployeeService } from '../../../../services/services';

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
    private showDescriptionText: boolean = false;

    constructor(
        private salaryBalanceLineService: SalaryBalanceLineService,
        private errorService: ErrorService,
        private employeeService: EmployeeService) {
        this.salaryTransactionsModel$ = new BehaviorSubject<SalaryTransaction[]>([]);
        this.description$ = new BehaviorSubject<string>('');
    }

    public ngOnInit() {
        this.createConfig();
    }

    public ngOnChanges() {
        if (this.salaryBalance && this.salaryBalance.ID) {
            let transObs = this.salaryBalance.SalaryBalanceLines && this.salaryBalance.SalaryBalanceLines.length
                ? Observable.of(this.salaryBalance.SalaryBalanceLines)
                : this.salaryBalanceLineService
                    .GetAll(`filter=SalaryBalanceID eq ${this.salaryBalance.ID}`);
            transObs
                .subscribe(transes => this.salaryTransactionsModel$.next(transes),
                err => this.errorService.handle(err));
            
            let empObs = this.salaryBalance.Employee && this.salaryBalance.Employee.BusinessRelationInfo
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
