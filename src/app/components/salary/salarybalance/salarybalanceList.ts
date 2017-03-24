import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { SalarybalanceService, ErrorService } from '../../../services/services';
import { SalaryBalance, SalBalType } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { SalarybalancelineModal } from './modals/salarybalancelinemodal';

@Component({
    selector: 'salarybalances',
    templateUrl: './salarybalanceList.html',
})
export class SalarybalanceList implements OnInit {

    private tableConfig: UniTableConfig;
    private salarybalances: SalaryBalance[];
    @ViewChild(SalarybalancelineModal) private salarybalanceModal: SalarybalancelineModal;

    constructor(
        private _router: Router,
        private route: ActivatedRoute,
        private tabSer: TabService,
        private _salarybalanceService: SalarybalanceService,
        private errorService: ErrorService
    ) {
        route.params.subscribe(params => {
            let empID: number = +params['empID'] || 0;
            this.tabSer
            .addTab({
                name: 'Saldo',
                url: 'salary/salarybalances' + (empID ? `;empID=${empID}` : ''),
                moduleID: UniModules.Salarybalances,
                active: true
            });

            this._salarybalanceService.getAll(empID)
                .subscribe((salarybalances: SalaryBalance[]) => {
                    if (salarybalances) {
                        salarybalances.forEach((salarybalance, index) => {
                            if (salarybalance.InstalmentType === SalBalType.Advance 
                                || salarybalance.InstalmentType === SalBalType.Garnishment 
                                || salarybalance.InstalmentType === SalBalType.Outlay) {
                                    this._salarybalanceService.getBalance(salarybalance.ID)
                                        .subscribe(balance => {
                                            salarybalance['_balance'] = balance;
                                            this.salarybalances = salarybalances;
                                        });
                            }
                        });
                    }
                });
        });
    }

    public ngOnInit() {
        this.createConfig();
    }

    private createConfig() {
        const idCol = new UniTableColumn('ID', 'Nr', UniTableColumnType.Number);
        idCol.setWidth('5rem');

        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text);
        const employeeCol = new UniTableColumn('EmployeeID', 'Ansattnr', UniTableColumnType.Text).setWidth('10rem');

        const typeCol = new UniTableColumn('InstalmentType', 'Type', UniTableColumnType.Money);

        const balanceCol = new UniTableColumn('_balance', 'Saldo', UniTableColumnType.Money);
        
        let contextMenu = {
            label: 'Legg til manuell post',
            action: (salbal) => {
                this.openSalarybalancelineModal(salbal);
            }
        };

        this.tableConfig = new UniTableConfig(false, true, 15)
            .setColumns([idCol, nameCol, employeeCol, typeCol, balanceCol])
            .setSearchable(true)
            .setContextMenu([contextMenu]);
    }

    public rowSelected(event) {
        this._router.navigateByUrl('/salary/salarybalances/' + event.rowModel.ID);
    }

    public createSalarybalance() {
        this._router.navigateByUrl('/salary/salarybalances/0');
    }

    public openSalarybalancelineModal(salarybalance: SalaryBalance) {
        this.salarybalanceModal.openModal(salarybalance, false);
    }
}
