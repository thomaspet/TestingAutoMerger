import {Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn, UniTable} from '../../../../../framework/ui/unitable/index';
import {SalarybalanceService, ErrorService, NumberFormat} from '../../../../services/services';
import {SalaryBalance, SalBalDrawType} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ReplaySubject} from 'rxjs';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

interface BalanceActionFormattedType {
    salaryBalanceID: number;
    balance: number;
}
const SELECTED_KEY = '_rowSelected';

@Component({
    selector: 'salarybalances',
    templateUrl: './salarybalanceList.html',
})
export class SalarybalanceList implements OnInit, OnChanges, AfterViewInit {
    @ViewChild(UniTable, { static: true }) private table: UniTable;

    @Input() public salarybalances: SalaryBalance[];
    @Input() public lightWeight: boolean;

    @Output() public selectedSalarybalance: EventEmitter<SalaryBalance> = new EventEmitter();
    @Output() public updatedList: EventEmitter<SalaryBalance[]> = new EventEmitter();
    @Output() public createSalaryBalance: EventEmitter<any> = new EventEmitter<any>();

    public tableConfig: UniTableConfig;
    public salaryBalances$: BehaviorSubject<SalaryBalance[]> = new BehaviorSubject([]);
    private table$: ReplaySubject<UniTable> = new ReplaySubject(1);
    public busy: boolean;

    private focus: SalaryBalance;
    private selected: SalaryBalance;

    constructor(
        private _salarybalanceService: SalarybalanceService,
        private numberService: NumberFormat
    ) {}

    public ngOnInit() {
        this.createConfig(this.lightWeight);
        this.salaryBalances$
            .subscribe(model => this.focusRow(model));
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['salarybalances']) {
            this.salaryBalances$.next(this.salarybalances.filter(x => !x.Deleted));
        }
    }

    public ngAfterViewInit() {
        this.table$.next(this.table);
    }

    public rowSelected(event) {
        this.selectedSalarybalance.emit(event.rowModel);
        this.updateSelected(event.rowModel);
    }

    public createSalarybalance() {
        this.createSalaryBalance.next();
    }

    private updateSelected(row: SalaryBalance) {
        this.table$
            .take(1)
            .map(table => table.getTableData())
            .map(salaryBalances => {
                salaryBalances.forEach(salBal => salBal[SELECTED_KEY] = salBal['_originalIndex'] === row['_originalIndex']);
                return salaryBalances;
            })
            .subscribe(salaryBalances => this.setSelected(salaryBalances));
    }

    private focusRow(salaryBalances: SalaryBalance[]) {
        const row = salaryBalances.find(x => x[SELECTED_KEY]);
        if (!row) {
            return;
        }
        this.table$
            .take(1)
            .subscribe(table => this.setFocus(row, salaryBalances, table));
    }

    private setFocus(salaryBalance: SalaryBalance, salaryBalances: SalaryBalance[], table: UniTable) {
        table.focusRow(
            salaryBalance['_originalIndex'] ||
            salaryBalances.findIndex(salBal => salaryBalance.ID
                ? salBal.ID === salaryBalance.ID
                : salBal._createguid === salaryBalance._createguid));
    }

    private setSelected(salaryBalances: SalaryBalance[]) {
        const selected = salaryBalances.find(salBal => salBal[SELECTED_KEY]);
        if (this.selected && this.selected['_originalIndex'] === selected['_originalIndex']) {
            return;
        }
        this.updatedList.next(salaryBalances);
        this.selected = selected;
    }

    private createConfig(lightWeight: boolean) {
        let activeColumns: UniTableColumn[] = [];

        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number)
            .setWidth('5rem');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
        const employeeCol = new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Text)
            .setWidth('15rem')
            .setTemplate((rowModel: SalaryBalance) => {
                return rowModel.Employee
                    ? rowModel.Employee.EmployeeNumber + ' - ' + rowModel.Employee.BusinessRelationInfo.Name
                    : '';
            });


        const typeCol = new UniTableColumn('InstalmentType', 'Type')
            .setTemplate((salarybalance: SalaryBalance) => {
                return salarybalance.InstalmentType ? this._salarybalanceService.getInstalment(salarybalance).Name : '';
            }).setWidth('7rem');

        const balanceCol = new UniTableColumn('CalculatedBalance', 'Saldo', UniTableColumnType.Text)
            .setAlignment('right')
            .setTemplate((salaryBalance: SalaryBalance) => {
                if (salaryBalance.CalculatedBalance === undefined || salaryBalance.CalculatedBalance === null) {
                    return '';
                }

                if (salaryBalance.Transactions && salaryBalance.Transactions.length) {
                    const sum = salaryBalance
                        .Transactions
                        .filter(salBal => (salBal.ID && !salBal.SalaryTransactionID)
                            || (salBal.SalaryTransaction
                                && salBal.SalaryTransaction.payrollrun
                                && !!salBal.SalaryTransaction.payrollrun.StatusCode))
                        .map(line => line.Amount)
                        .reduce((acc, curr) => acc + curr, 0);
                    return this.numberService.asMoney(sum);
                }
                return this.numberService.asMoney(salaryBalance.CalculatedBalance);
            })
            .setWidth('14rem');

        if (!lightWeight) {
            activeColumns = [idCol, nameCol, employeeCol, typeCol, balanceCol];
        } else {
            balanceCol.setWidth('');
            activeColumns = [idCol, typeCol, balanceCol];
        }

        this.tableConfig = new UniTableConfig('salary.salarybalance.list', false, !lightWeight, 15)
            .setColumns(activeColumns)
            .setDeleteButton(lightWeight ? {
                deleteHandler: row => this.handleDeletion(row)
            } : false)
            .setSearchable(true);
    }

    private handleDeletion(row: SalaryBalance) {
        if (!row.ID) {
            this.updatedList.next(this.salarybalances.filter(x => x['_originalIndex'] !== row['_originalIndex']));
            return;
        }
        row.Deleted = true;
        row[SELECTED_KEY] = false;
        const index = this.salarybalances.findIndex(salBal => row.ID
            ? row.ID === salBal.ID
            : row._createguid === salBal._createguid
        );
        this.salarybalances[index] = row;
        this.updatedList.next(this.salarybalances);
    }
}
