import {Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn, UniTable} from '../../../../../framework/ui/unitable/index';
import {SalarybalanceService, ErrorService, NumberFormat} from '../../../../services/services';
import {SalaryBalance, SalBalDrawType} from '../../../../unientities';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ReplaySubject} from 'rxjs/ReplaySubject';

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
    private salarybalances: SalaryBalance[] = [];
    private empID: number;
    @Input() public employeeID: number;
    @Output() public selectedSalarybalance: EventEmitter<SalaryBalance> = new EventEmitter();
    @ViewChild(UniTable) private table: UniTable;
    private table$: ReplaySubject<UniTable> = new ReplaySubject(1);
    private selectedIndex: number;
    private busy: boolean;

    constructor(
        private _router: Router,
        private route: ActivatedRoute,
        private tabSer: TabService,
        private _salarybalanceService: SalarybalanceService,
        private errorService: ErrorService,
        private numberService: NumberFormat
    ) {

    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            const empID: number = +params['empID'] || (this.employeeID !== undefined ? this.employeeID : 0);
            this.empID = empID;
            this.selectedIndex = undefined;
        });

        if (this.empID === 0 && this.employeeID === undefined) {
            this.tabSer
                .addTab({
                    name: 'Saldo',
                    url: 'salary/salarybalances' + (this.empID ? `;empID=${this.empID}` : ''),
                    moduleID: UniModules.Salarybalances,
                    active: true
                });
        }
        this.createConfig();
        this.loadData(this.empID);
    }

    public ngOnChanges() {
        if (this.employeeID) {
            this.empID = this.employeeID;
        }
        this.busy = true;
        this.loadData(this.empID);
    }

    public ngAfterViewInit() {
        this.table$.next(this.table);
    }

    public rowSelected(event) {
        this.employeeID ?
        this.selectedSalarybalance.emit(event.rowModel) :
        this._router.navigateByUrl('/salary/salarybalances/' + event.rowModel.ID);
    }

    public createSalarybalance() {
        if (this.employeeID) {
            this._salarybalanceService.GetNewEntity()
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe((salarybalance: SalaryBalance) => {
                    const newSalarybalance = salarybalance;
                    newSalarybalance.EmployeeID = this.empID;
                    newSalarybalance['_createguid'] = this._salarybalanceService.getNewGuid();
                    this.salarybalances.push(newSalarybalance);
                    this.addAndFocusRow(newSalarybalance, this.salarybalances);
                    this.selectedSalarybalance.emit(newSalarybalance);
                });
        } else {
            this._router.navigateByUrl('/salary/salarybalances/0');
        }
    }

    public loadData(empID: number = this.empID) {
        this._salarybalanceService
            .getAll(empID, ['Employee.BusinessRelationInfo'])
            .map(salaryBalances => this.sortList(salaryBalances))
            .do(salarybalances => {
                if (this.employeeID !== undefined) {
                    this.focusRow(empID);
                }
            })
            .finally(() => this.busy = false)
            .subscribe((salarybalances: SalaryBalance[]) => {
                this.salarybalances = salarybalances;
                if (this.employeeID) {
                    let salbal: SalaryBalance = new SalaryBalance();
                    salbal.EmployeeID = this.employeeID;
                    if (this.salarybalances.length > 0) {
                        salbal = this.salarybalances[0];
                    }
                    this.selectedSalarybalance.emit(salbal);
                }
            });
    }

    private focusRow(salarybalanceID: number) {
        if (isNaN(salarybalanceID)) {
            salarybalanceID = undefined;
        }

        if (this.selectedIndex === undefined && this.salarybalances.length) {

            let focusIndex = this.salarybalances
                .findIndex(salarybalance =>
                    salarybalanceID !== undefined
                    ? salarybalance.ID === salarybalanceID
                    : false);

            if (focusIndex === -1) {
                focusIndex = 0;
            }

            if (this.table) {
                this.table.focusRow(focusIndex);
            }
        }
    }

    private addAndFocusRow(salarybalance: SalaryBalance, salarybalances: SalaryBalance[]) {
        this.table$
        .asObservable()
        .filter(table => !!table)
        .take(1)
        .subscribe(table => {
            if (table.getTableData().length !== salarybalances.length) {
                table.addRow(salarybalance);
            }
            table.focusRow(salarybalances.length - 1);
        });
    }

    private createConfig() {
        let activeColumns: UniTableColumn[] = [];

        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('5rem');

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

        if (!this.employeeID) {
            activeColumns = [idCol, nameCol, employeeCol, typeCol, balanceCol];
        } else {
            balanceCol.setWidth('');
            activeColumns = [idCol, typeCol, balanceCol];
        }

        this.tableConfig = new UniTableConfig('salary.salarybalance.list', false, true, 15)
            .setColumns(activeColumns)
            .setSearchable(true);
    }

    private sortList(salaryBalances: SalaryBalance[]): SalaryBalance[] {
        return salaryBalances
            .sort((salBal1, salBal2) => this.getSortingValue(salBal2) - this.getSortingValue(salBal1));
    }

    private getSortingValue(salaryBalance: SalaryBalance) {
        return Math.abs(salaryBalance.CalculatedBalance || 0)
            + (salaryBalance.Type === SalBalDrawType.FixedAmount ? 1 : 0);
    }
}
