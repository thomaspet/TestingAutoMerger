import {Component, OnInit, Input, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '../../../../../framework/ui/unitable/index';
import {SalaryBalance, Employee, SalaryBalanceLine, SalaryTransaction, PayrollRun} from '../../../../unientities';
import {
    SalaryBalanceLineService, ErrorService, EmployeeService, SalaryTransactionService
} from '../../../../services/services';

@Component({
    selector: 'salary-balance-summary',
    templateUrl: './salaryBalanceSummary.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryBalanceSummary implements OnInit, OnChanges {

    @Input() private salaryBalance: SalaryBalance;
    private salarybalanceLinesModel$: BehaviorSubject<SalaryBalanceLine[]>;
    private description$: BehaviorSubject<string>;
    private tableConfig: UniTableConfig;
    public showDescriptionText: boolean = false;

    constructor(
        private salaryBalanceLineService: SalaryBalanceLineService,
        private errorService: ErrorService,
        private salarytransactionService: SalaryTransactionService,
        private employeeService: EmployeeService
    ) {
        this.salarybalanceLinesModel$ = new BehaviorSubject<SalaryBalanceLine[]>([]);
        this.description$ = new BehaviorSubject<string>('');
    }

    public ngOnInit() {
        this.createConfig();
    }

    public ngOnChanges() {
        if (this.salaryBalance && this.salaryBalance.ID) {

            let transObs = this.salaryBalance.Transactions && this.salaryBalance.Transactions.length
                ? Observable.of(this.salaryBalance.Transactions)
                : this.salaryBalanceLineService
                    .GetAll(`filter=SalaryBalanceID eq ${this.salaryBalance.ID}`);
            transObs
            .switchMap((response: SalaryBalanceLine[]) => {
                let filter = [];
                response.forEach(balanceline => {
                    if (balanceline.SalaryTransactionID) {
                        filter.push(`ID eq ${balanceline.SalaryTransactionID}`);
                    }
                });

                return !filter.length ?
                    Observable.of(response)
                    : this.salarytransactionService.GetAll(`filter=${filter.join(' or ')}`, ['payrollrun'])
                    .map((transes: SalaryTransaction[]) => {
                        response.forEach(salarybalanceline => {
                            transes.forEach(salarytransaction => {
                                if (salarybalanceline.SalaryTransactionID === salarytransaction.ID) {
                                    salarybalanceline['_payrollrun'] = salarytransaction.payrollrun;
                                }
                            });
                        });
                        return response;
                    });
            })
                .subscribe((transes: SalaryBalanceLine[]) => {
                    this.salarybalanceLinesModel$.next(transes);
                }, err => this.errorService.handle(err));

            let empObs = this.salaryBalance.Employee && this.salaryBalance.Employee.BusinessRelationInfo
                ? Observable.of(this.salaryBalance.Employee)
                : this.employeeService
                    .Get(this.salaryBalance.EmployeeID, ['BusinessRelationInfo']);

            empObs.subscribe(
                (emp: Employee) => this.description$
                    .next(
                        `SaldoId nr ${this.salaryBalance.ID}, `
                        + `Ansattnr ${emp.EmployeeNumber} - ${emp.BusinessRelationInfo.Name}`
                    ),
                err => this.errorService.handle(err));
        } else {
            this.salarybalanceLinesModel$.next([]);
            this.description$.next('');
        }
    }

    private createConfig() {
        const nameCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text);
        const startDateCol = new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate)
            .setWidth('7rem');
        const sumCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
            .setWidth('12rem');
        const payRunCol = new UniTableColumn('_payrollrun', 'Lønnsavregning', UniTableColumnType.Number)
            .setTemplate((row: SalaryBalanceLine) => {
                let run: PayrollRun = row['_payrollrun'];
                return run ? `${run.ID} - ${run.Description}` : 'manuelt trekk';
            })
            .setWidth('9rem');

        let columnList = [nameCol, startDateCol, sumCol, payRunCol];

        this.tableConfig = new UniTableConfig('salary.salarybalance.summary', false, false)
            .setColumns(columnList);
    }
}
