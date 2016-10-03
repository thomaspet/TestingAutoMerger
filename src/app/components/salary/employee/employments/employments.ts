import {Component, ViewChild, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniView} from '../../../../../framework/core/uniView';
import {EmploymentService} from '../../../../services/services';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {EmploymentDetails} from './employmentDetails';
import {Employee, Employment} from '../../../../unientities';

import {UniCacheService} from '../../../../services/services';

@Component({
    selector: 'employments',
    templateUrl: 'app/components/salary/employee/employments/employments.html',
    directives: [UniTable, EmploymentDetails],
})
export class Employments extends UniView {
    @ViewChild(UniTable)
    private table: UniTable;

    private employee: Employee;
    private employments: Employment[] = [];
    private selectedIndex: number;
    private tableConfig: UniTableConfig;

    constructor(private employmentService: EmploymentService,
                cacheService: UniCacheService,
                router: Router,
                route: ActivatedRoute) {

        super(router.url, cacheService);

        this.tableConfig = new UniTableConfig(false).setColumns([
            new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem'),
            new UniTableColumn('JobName', 'Stillingsnavn'),
            new UniTableColumn('JobCode', 'Stillingskode')
        ]);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);

            super.getStateSubject('employee').subscribe(employee => this.employee = employee);
            super.getStateSubject('employments').subscribe((employments) => {
                this.employments = employments || [];

                // init selected to standard employment or first row in table
                // checking for undefined here, as we dont want id === 0 to trigger the init
                if (this.selectedIndex === undefined) {
                    let focusIndex = this.employments.findIndex(employment => employment.Standard);
                    if (focusIndex === -1) {
                        focusIndex = 0;
                    }

                    if (this.table) {
                        this.table.focusRow(focusIndex);
                    }
                    this.selectedIndex = focusIndex;
                }
            });
        });
    }

    private newEmployment() {
        this.employmentService.GetNewEntity().subscribe((response: Employment) => {
            let newEmployment = response;
            newEmployment.EmployeeNumber = this.employee.EmployeeNumber;
            newEmployment.EmployeeID = this.employee.ID;
            newEmployment.JobCode = '';
            newEmployment.JobName = '';
            newEmployment.StartDate = new Date();
            newEmployment.LastSalaryChangeDate = new Date();
            newEmployment.LastWorkPercentChangeDate = new Date();
            newEmployment.SeniorityDate = new Date();

            this.employments.push(newEmployment);
            this.table.addRow(newEmployment);
            this.table.focusRow(this.employments.length - 1);
        });
    }

    private onEmploymentChange(employment) {
        employment['_isDirty'] = true;
        super.updateState('employments', this.employments, true);
    }

    private onRowSelected(event) {
        // Update table when switching rows
        const currentEmployment = this.employments[this.selectedIndex];
        if (currentEmployment['_isDirty']) {
            this.table.updateRow(this.selectedIndex, currentEmployment);
        }

        this.selectedIndex = event.rowModel['_originalIndex'];
    }
}
