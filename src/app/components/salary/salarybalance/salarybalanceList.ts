import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../framework/ui/unitable/index';
import {SalarybalanceService, ErrorService, NumberFormat} from '../../../services/services';
import {SalaryBalance, SalBalDrawType} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

type BalanceActionFormattedType = {
    salaryBalanceID: number,
    balance: number
};

@Component({
    selector: 'salarybalances',
    templateUrl: './salarybalanceList.html',
})
export class SalarybalanceList implements OnInit {

    private tableConfig: UniTableConfig;
    private salarybalances: SalaryBalance[] = [];
    private empID: number;

    constructor(
        private _router: Router,
        private route: ActivatedRoute,
        private tabSer: TabService,
        private _salarybalanceService: SalarybalanceService,
        private errorService: ErrorService,
        private numberService: NumberFormat
    ) {
        route.params.subscribe(params => {
            let empID: number = +params['empID'] || 0;
            this.empID = empID;
            this.tabSer
                .addTab({
                    name: 'Saldo',
                    url: 'salary/salarybalances' + (empID ? `;empID=${empID}` : ''),
                    moduleID: UniModules.Salarybalances,
                    active: true
                });

            this.setData(empID);
        });
    }

    public ngOnInit() {
        this.createConfig();
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/salarybalances/' + event.rowModel.ID);
    }

    public createSalarybalance() {
        this._router.navigateByUrl('/salary/salarybalances/0');
    }

    public setData(empID: number = this.empID) {
        this._salarybalanceService
            .getAll(empID, ['Employee.BusinessRelationInfo'])
            .map(salaryBalances => this.sortList(salaryBalances))
            .subscribe((salarybalances: SalaryBalance[]) => {
                this.salarybalances = salarybalances;
            });
    }

    private createConfig() {
        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('5rem');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
        const employeeCol = new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Text)
            .setWidth('15rem')
            .setTemplate((rowModel: SalaryBalance) => {
                return rowModel.Employee
                    ? rowModel.Employee.EmployeeNumber + ' - ' + rowModel.Employee.BusinessRelationInfo.Name
                    : '';
            });


        const typeCol = new UniTableColumn('InstalmentType', 'Type')
            .setTemplate((salarybalance: SalaryBalance) => {
                return this._salarybalanceService.getInstalment(salarybalance).Name;
            }).setWidth('7rem');

        const balanceCol = new UniTableColumn('CalculatedBalance', 'Saldo', UniTableColumnType.Text)
            .setAlignment('right')
            .setTemplate((salaryBalance: SalaryBalance) =>
                salaryBalance.CalculatedBalance || salaryBalance.CalculatedBalance === 0
                    ? this.numberService.asMoney(salaryBalance.CalculatedBalance)
                    : '')
            .setWidth('14rem');

        this.tableConfig = new UniTableConfig('salary.salarybalance.list', false, true, 15)
            .setColumns([idCol, nameCol, employeeCol, typeCol, balanceCol])
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
