import {Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, AfterViewInit, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn, UniTable} from '../../../../../framework/ui/unitable/index';
import {SalarybalanceService, ErrorService, NumberFormat} from '../../../../services/services';
import {SalaryBalance, SalBalDrawType} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Observable} from 'rxjs/Observable';

interface BalanceActionFormattedType {
    salaryBalanceID: number;
    balance: number;
}

@Component({
    selector: 'salarybalances',
    templateUrl: './salarybalanceList.html',
})
export class SalarybalanceList implements OnInit, OnChanges, AfterViewInit {

    private tableConfig: UniTableConfig;
    @Input() public salarybalances: SalaryBalance[];
    @Input() public lightWeight: boolean;
    @Output() public selectedSalarybalance: EventEmitter<SalaryBalance> = new EventEmitter();
    @Output() public createSalaryBalance: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(UniTable) private table: UniTable;
    private table$: ReplaySubject<UniTable> = new ReplaySubject(1);
    private salaryBalances$: ReplaySubject<SalaryBalance[]> = new ReplaySubject(1);
    private busy: boolean;

    constructor(
        private _salarybalanceService: SalarybalanceService,
        private numberService: NumberFormat
    ) {}

    public ngOnInit() {
        this.createConfig(this.lightWeight);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['salarybalances']) {
            this.salaryBalances$.next(this.salarybalances);
        }
    }

    public ngAfterViewInit() {
        this.table$.next(this.table);
    }

    public rowSelected(event) {
        this.selectedSalarybalance.emit(event.rowModel);
    }

    public createSalarybalance() {
        this.createSalaryBalance.next();
    }

    public selectRow(salaryBalance: SalaryBalance) {
        Observable
            .combineLatest(
            this.table$.asObservable(),
            this.salaryBalances$
                .asObservable()
                .filter(salBals => !!salBals.length && salBals[0].EmployeeID === salaryBalance.EmployeeID))
            .take(1)
            .map((result: [UniTable, SalaryBalance[]]) => {
                const [table, salaryBalances] = result;
                const rowIndx = salaryBalances.findIndex(row => row.ID === salaryBalance.ID);
                const focusRow = salaryBalances[rowIndx];
                table.focusRow((focusRow && focusRow['_originalIndex']) || rowIndx);
                return focusRow;
            })
            .filter(salBal => !!salBal)
            .subscribe((salBal) => this.selectedSalarybalance.next(salBal));
    }

    public addRow(salaryBalance: SalaryBalance): void {
        this.table$
            .map(table => {
                table.addRow(salaryBalance);
                table.focusRow(table.getTableData().length - 1);
                return salaryBalance;
            })
            .subscribe(salBal => this.selectedSalarybalance.next(salaryBalance));
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
            .setTemplate((salaryBalance: SalaryBalance) =>
                salaryBalance.CalculatedBalance || salaryBalance.CalculatedBalance === 0
                    ? this.numberService.asMoney(salaryBalance.CalculatedBalance)
                    : '')
            .setWidth('14rem');

        if (!lightWeight) {
            activeColumns = [idCol, nameCol, employeeCol, typeCol, balanceCol];
        } else {
            balanceCol.setWidth('');
            activeColumns = [idCol, typeCol, balanceCol];
        }

        this.tableConfig = new UniTableConfig('salary.salarybalance.list', false, true, 15)
            .setColumns(activeColumns)
            .setSearchable(true);
    }
}
