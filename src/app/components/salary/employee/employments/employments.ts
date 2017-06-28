import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniView } from '../../../../../framework/core/uniView';
import { EmploymentService } from '../../../../services/services';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from '../../../../../framework/ui/unitable/index';
import { Employee, Employment, SubEntity, Project, Department } from '../../../../unientities';
import { UniCacheService, ErrorService } from '../../../../services/services';

@Component({
    selector: 'employments',
    templateUrl: './employments.html'
})
export class Employments extends UniView {
    @ViewChild(UniTable)
    private table: UniTable;

    private employee: Employee;
    private employments: Employment[] = [];
    private selectedIndex: number;
    private tableConfig: UniTableConfig;
    private subEntities: SubEntity[];
    private projects: Project[];
    private departments: Department[];

    constructor(
        private employmentService: EmploymentService,
        cacheService: UniCacheService,
        router: Router,
        route: ActivatedRoute,
        private errorService: ErrorService
    ) {

        super(router.url, cacheService);

        this.tableConfig = new UniTableConfig(false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem'),
                new UniTableColumn('JobName', 'Stillingsnavn'),
                new UniTableColumn('JobCode', 'Stillingskode')
            ]);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.selectedIndex = undefined;

            super.getStateSubject('subEntities')
                .subscribe(subEntities => this.subEntities = subEntities, err => this.errorService.handle(err));

            super.getStateSubject('employee')
                .subscribe(employee => this.employee = employee, err => this.errorService.handle(err));

            super.getStateSubject('projects')
                .subscribe(projects => this.projects = projects, err => this.errorService.handle(err));

            super.getStateSubject('departments')
                .subscribe(departments => this.departments = departments, err => this.errorService.handle(err));
        });

        route.params.subscribe((paramsChange) => {
            super.getStateSubject('employments')
                .subscribe((employments) => {
                    this.employments = employments || [];
                    setTimeout(() => this.focusRow(+paramsChange['EmploymentID']));
                }, err => this.errorService.handle(err));
        });
    }

    public ngOnDestroy() {
        // Remove untouched new rows
        let employments = this.employments.filter(emp => emp.ID > 0 || emp['_isDirty']);
        if (employments.length !== this.employments.length) {
            let isDirty = employments.some(emp => emp['_isDirty']);
            super.updateState('employments', employments, isDirty);
        }
    }

    private focusRow(employmentID: number) {
        if (isNaN(employmentID)) {
            employmentID = undefined;
        }

        if (employmentID === 0) {
            this.newEmployment();
            return;
        }

        if (this.selectedIndex === undefined && this.employments.length) {

            let focusIndex = this.employments.findIndex(employment => employmentID !== undefined 
                ? employment.ID === employmentID 
                : employment.Standard);
                
            if (focusIndex === -1) {
                focusIndex = 0;
            }

            if (this.table) {
                this.table.focusRow(focusIndex);
            }
        }
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
            newEmployment.SubEntityID = this.employee.SubEntityID;

            newEmployment['_createguid'] = this.employmentService.getNewGuid();

            this.employments.push(newEmployment);
            this.table.addRow(newEmployment);
            this.table.focusRow(this.employments.length - 1);
        }, err => this.errorService.handle(err));
    }

    private onEmploymentChange(employment: Employment) {
        employment['_isDirty'] = true;

        // Update employments array and table row
        const index = this.employments.findIndex((emp) => {
            if (!emp.ID) {
                return emp['_createguid'] === employment['_createguid'];
            }

            return emp.ID === employment.ID;
        });

        this.employments[index] = employment;
        super.updateState('employments', this.employments, true);
    }

    private onRowSelected(event) {
        this.table.updateRow(this.selectedIndex, this.employments[this.selectedIndex]);
        this.selectedIndex = event.rowModel['_originalIndex'];
    }
}
