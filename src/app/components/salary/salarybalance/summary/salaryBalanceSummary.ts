import {
    Component, OnInit, ViewChild, Input, Output, OnChanges,
    ChangeDetectionStrategy, EventEmitter, SimpleChanges, SimpleChange
} from '@angular/core';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {
    UniTableConfig, UniTableColumn, UniTableColumnType, UniTable, IRowChangeEvent
} from '../../../../../framework/ui/unitable';
import {SalaryBalance, Employee, SalaryBalanceLine, SalaryTransaction, PayrollRun, SalBalType} from '../../../../unientities';
import {
    SalaryBalanceLineService, ErrorService, EmployeeService, SalaryTransactionService, PayrollrunService
} from '../../../../services/services';
import {SalarybalanceLine} from '../salarybalanceLine';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'salary-balance-summary',
    templateUrl: './salaryBalanceSummary.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalaryBalanceSummary implements OnInit, OnChanges {

    @Input() public salaryBalance: SalaryBalance;
    @Input() public busy: boolean;
    @Output() public changeEvent: EventEmitter<SalaryBalanceLine[]> = new EventEmitter();
    @ViewChild(AgGridWrapper, { static: false }) private table: UniTable;
    public editMode: boolean;
    private salarybalanceLinesModel$: BehaviorSubject<SalaryBalanceLine[]>;
    public tableModel$: BehaviorSubject<SalaryBalanceLine[]>;
    public description$: BehaviorSubject<string>;
    public tableConfig: UniTableConfig;
    public showDescriptionText: boolean = false;
    public showAllLines: boolean;
    public showAllLinesModel: {showAll: boolean} = {showAll: false};
    private isUnionType: boolean;

    constructor(
        private salaryBalanceLineService: SalaryBalanceLineService,
        private errorService: ErrorService,
        private salarytransactionService: SalaryTransactionService,
        private employeeService: EmployeeService,
        private payrollrunService: PayrollrunService
    ) {
        this.salarybalanceLinesModel$ = new BehaviorSubject<SalaryBalanceLine[]>([]);
        this.tableModel$ = new BehaviorSubject<SalaryBalanceLine[]>([]);
        this.description$ = new BehaviorSubject<string>('');
    }

    public ngOnInit() {
        this.createConfig(this.editMode);
    }

    public ngOnChanges(change: SimpleChanges) {
        if (change['salaryBalance']) {
            this.handleTableBlur(change['salaryBalance']);
            this.onSalaryBalanceChange(change['salaryBalance'].currentValue);
        }
        if (change['busy'] && !change['busy'].firstChange) {
            this.onBusychange(change['busy'].currentValue);
        }
    }

    private handleTableBlur(salBalChange: SimpleChange) {
        if (!this.editMode) { return; }
        if (!this.table) { return; }
        const currentSalBal: SalaryBalance = salBalChange.currentValue;
        const prevSalBal: SalaryBalance = salBalChange.previousValue;
        if (!prevSalBal) {
            return;
        }
        if (!currentSalBal || prevSalBal.ID !== currentSalBal.ID) {
            this.toggleEditMode(false);
        }
    }

    public onBusychange(busy: boolean) {
        if (busy) {
            return;
        }
        this.toggleEditMode(false);
    }

    private toggleEditMode(editMode) {
        this.editMode = editMode;
        this.createConfig(editMode);
    }

    public onSalaryBalanceChange(salaryBalance: SalaryBalance) {
        if (!salaryBalance || !salaryBalance.ID) {
            this.updateModel([]);
            this.description$.next('');
            return;
        }
        this.isUnionType = salaryBalance.InstalmentType === SalBalType.Union ? true : false;

        const transObs = salaryBalance.Transactions && salaryBalance.Transactions.length
            ? Observable.of(salaryBalance.Transactions)
            : this.handleCache(salaryBalance);

        transObs
            .switchMap((response: SalaryBalanceLine[]) => {
                const filter = [];
                response.forEach(balanceline => {
                    if (balanceline.SalaryTransactionID) {
                        filter.push(`ID eq ${balanceline.SalaryTransactionID}`);
                    }
                });

                return !filter.length ?
                    Observable.of(response)
                    : this.salarytransactionService
                        .GetAll(`filter=${filter.join(' or ')}`, ['payrollrun'])
                        .map((transes: SalaryTransaction[]) => this.mapRunToBalanceLines(response, transes));
            })
            .subscribe((transes: SalaryBalanceLine[]) => {
                this.updateModel(transes);
            }, err => this.errorService.handle(err));

        const empObs = salaryBalance.Employee && salaryBalance.Employee.BusinessRelationInfo
            ? Observable.of(salaryBalance.Employee)
            : this.employeeService.Get(salaryBalance.EmployeeID, ['BusinessRelationInfo']);

        empObs.subscribe(
            (emp: Employee) => this.description$
                .next(
                `SaldoId nr ${salaryBalance.ID}, `
                + `Ansattnr ${emp.EmployeeNumber} - ${emp.BusinessRelationInfo.Name}`
                ),
            err => this.errorService.handle(err));
    }

    private handleCache(salaryBalance: SalaryBalance) {
        this.salaryBalanceLineService.invalidateCache();
        return this.salaryBalanceLineService.GetAll(`filter=SalaryBalanceID eq ${salaryBalance.ID}`);
    }

    private mapRunToBalanceLines(
        salaryBalanceLines: SalaryBalanceLine[],
        transes: SalaryTransaction[]): SalaryBalanceLine[] {

        salaryBalanceLines.forEach(salarybalanceline => {
            transes.forEach(salarytransaction => {
                if (salarybalanceline.SalaryTransactionID !== salarytransaction.ID) {
                    return;
                }
                salarybalanceline['_payrollrun'] = salarytransaction.payrollrun;
            });
        });

        return salaryBalanceLines;
    }

    private updateModel(salaryBalanceLines: SalaryBalanceLine[]) {
        this.salarybalanceLinesModel$.next(salaryBalanceLines);
        this.tableModel$.next([]);
        this.tableModel$.next(this.getTableLines(salaryBalanceLines));
    }

    public toggleShowAllLines(event) {
        this.showAllLines = event.checked;
        this.showAllLinesModel = {
            showAll: this.showAllLines
        };
        this.salarybalanceLinesModel$
            .asObservable()
            .take(1)
            .subscribe(lines => this.tableModel$.next(this.getTableLines(lines)));
    }

    private getTableLines(salaryBalanceLines: SalaryBalanceLine[]) {
        return this.showAllLines
            ? salaryBalanceLines
            : salaryBalanceLines.filter(line => {
                const run = line['_payrollrun'];
                const status = run && run['StatusCode'];
                return !line.SalaryTransactionID || !!status;
            });
    }

    private createConfig(editMode: boolean) {
        const nameCol = new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text, row => !row.ID);
        const startDateCol = new UniTableColumn('Date', 'Dato', UniTableColumnType.LocalDate, row => !row.ID)
            .setWidth('7rem');
        const sumCol = new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money, row => !row.ID)
            .setIsSumColumn(true);
        const payRunCol = new UniTableColumn('_payrollrun', 'Lønnsavregning', UniTableColumnType.Number, false)
            .setTemplate((row: SalaryBalanceLine) => {
                if (row['_isEmpty']) {
                    return;
                }
                const run: PayrollRun = row['_payrollrun'];
                return run ? `${run.ID} - ${run.Description}` : 'manuelt trekk';
            })
            .setWidth('9rem');
        const statusCol = new UniTableColumn('_payrollrun', 'Status', UniTableColumnType.Text, false)
            .setTemplate((row: SalarybalanceLine) => {
                const run: PayrollRun = row['_payrollrun'];
                const status = this.payrollrunService.getStatus(run);
                return run ? `${status.text}` : '';
            });

        const columnList = [nameCol, startDateCol, sumCol, payRunCol, statusCol];

        this.tableConfig = new UniTableConfig('salary.salarybalance.summary', !!editMode, false)
            .setColumns(columnList)
            .setAutoAddNewRow(true)
            .setChangeCallback((event) => this.emitChanges(event));
    }

    private emitChanges(event: IRowChangeEvent) {
        const tableData = [
            ...this.table.getTableData().filter(x => x['_originalIndex'] !== event.rowModel['_originalIndex']),
            event.rowModel];

        const lines = this.salarybalanceLinesModel$.getValue();

        this.salarybalanceLinesModel$.next([
            ...lines.filter(line => line['_originalIndex'] !== event.rowModel['_originalIndex']),
            event.rowModel,
        ]);

        const rows: SalaryBalanceLine[] = tableData
            .filter((row: SalaryBalanceLine) => !row.ID && !!row.Amount && !!row.Date);

        if (!rows.length) {
            return;
        }

        rows.forEach(row => {
            if (!!row._createguid) {
                return;
            }
            row._createguid = this.salaryBalanceLineService.getNewGuid();
            row.SalaryBalanceID = this.salaryBalance && this.salaryBalance.ID;
        });

        this.changeEvent.next(rows);
        return event.rowModel;
    }

    public activateEditMode() {
        if (!this.editMode) {
            this.table.addRow(null);
        }

        this.editMode = true;
        this.createConfig(this.editMode);
        if (!this.table || !this.table.getTableData().length) {
            return;
        }

        this.table.focusRow(this.table.getTableData().length);
    }
}
