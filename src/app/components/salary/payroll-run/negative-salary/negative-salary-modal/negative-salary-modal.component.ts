import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { SalaryTransaction } from '@uni-entities';
import { StatisticsService, ErrorService } from '@app/services/services';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'uni-negative-salary-modal',
  templateUrl: './negative-salary-modal.component.html',
  styleUrls: ['./negative-salary-modal.component.sass']
})
export class NegativeSalaryModalComponent implements OnInit, IUniModal {

    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    @Input() public options: IModalOptions;
    public payrollRunID: Number;

    public lookupFunction: (urlParams: HttpParams) => any;
    public negativeSalaryListConfig: UniTableConfig;

    constructor(private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private router: Router) { }

    ngOnInit() {
        this.payrollRunID = this.options.data;
        this.createTableConfig();
    }

    private createTableConfig() {
        this.lookupFunction = (urlParams: HttpParams) => {
            const params = (urlParams || new HttpParams())
                .set('model', 'SalaryTransaction')
                .set('select', 'EmployeeID as ID,EmployeeNumber as EmployeeNumber,BusinessRelationInfo.Name as Name,sum(Sum) as Sum')
                .set('filter', `PayrollRunID eq ${this.payrollRunID} and Wagetype.Base_Payment eq 1`)
                .set('having', 'sum(Sum) lt 0')
                .set('expand', 'Employee.BusinessRelationInfo,WageType');

            return this.statisticsService
                .GetAllByHttpParams(params, true)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const number = new UniTableColumn('EmployeeNumber', 'Nr', UniTableColumnType.Number).setMaxWidth(75);
        const name = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setLinkClick((row: SalaryTransaction) => {
            this.router.navigateByUrl(`/salary/employees/${row.ID}/personal-details`).then(() => this.close());
        });
        const sum = new UniTableColumn('Sum', 'Total lønn', UniTableColumnType.Number);

        this.negativeSalaryListConfig = new UniTableConfig('salary.payrollrun.payrollrunList', false)
            .setColumns([number, name, sum]);
    }
    public close() {
        this.onClose.next();
    }
}
