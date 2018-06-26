import {Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniView} from '../../../../../framework/core/uniView';
import {EmploymentService} from '../../../../services/services';
import {
    UniTable, UniTableConfig, UniTableColumnType, UniTableColumn
} from '../../../../../framework/ui/unitable/index';
import {Employee, Employment, SubEntity, Project, Department, EmploymentValidValues} from '../../../../unientities';
import {UniCacheService, ErrorService} from '../../../../services/services';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'employments',
    templateUrl: './employments.html'
})
export class Employments extends UniView implements OnInit, OnDestroy {
    @ViewChild(UniTable) private table: UniTable;

    public employee: Employee;
    public employments: Employment[] = [];
    private selectedIndex: number;
    public tableConfig: UniTableConfig;
    public subEntities: SubEntity[];
    public projects: Project[];
    public departments: Department[];
    public employeeID: number;
    public selectedEmployment$: ReplaySubject<Employment> = new ReplaySubject(1);

    constructor(
        private employmentService: EmploymentService,
        protected cacheService: UniCacheService,
        private router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);
        this.tableConfig = new UniTableConfig('salary.employee.employments', false)
            .setColumnMenuVisible(false)
            .setColumns([
                new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem'),
                new UniTableColumn('JobName', 'Stillingsnavn'),
                new UniTableColumn('JobCode', 'Stillingskode')
            ])
            .setSearchable(true);
    }

    public ngOnInit() {
        Observable.combineLatest(
            this.route.parent.params,
            this.route.queryParams
        ).subscribe(res => {
            const [params, queryParams] = res;

            super.updateCacheKey(this.router.url);
            this.employeeID = +params['id'];
            this.selectedIndex = undefined;

            super.getStateSubject('subEntities')
                .subscribe(subEntities => this.subEntities = subEntities, err => this.errorService.handle(err));

            super.getStateSubject('employee')
                .subscribe(employee => this.employee = employee, err => this.errorService.handle(err));

            super.getStateSubject('projects')
                .subscribe(projects => this.projects = projects, err => this.errorService.handle(err));

            super.getStateSubject('departments')
                .subscribe(departments => this.departments = departments, err => this.errorService.handle(err));

            super.getStateSubject('employments').subscribe((employments: Employment[]) => {
                this.employments = employments || [];

                if (employments && employments.length) {
                    const employmentID = +queryParams['EmploymentID'];

                    if (this.selectedIndex >= 0) {
                        this.selectedEmployment$.next(employments[this.selectedIndex]);
                    } else {
                        let index;
                        if (employmentID) {
                            index = employments.findIndex(e => e.ID === employmentID);
                        } else {
                            index = employments.findIndex(e => e.Standard);
                        }

                        this.selectedIndex = index >= 0 ? index : 0;
                        this.selectedEmployment$.next(employments[this.selectedIndex]);

                        setTimeout(() => {
                            if (this.table) {
                                this.table.focusRow(this.selectedIndex);
                            }
                        });
                    }
                } else {
                    this.newEmployment();
                }
            });

        });
    }

    public ngOnDestroy() {
        // Remove untouched new rows
        const employments = this.employments.filter(emp => emp.ID > 0 || emp['_isDirty']);
        if (employments.length !== this.employments.length) {
            const isDirty = employments.some(emp => emp['_isDirty']);
            super.updateState('employments', employments, isDirty);
        }
    }

    private focusRow(employmentID: number) {
        if (isNaN(employmentID)) {
            employmentID = undefined;
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

    public newEmployment() {
        this.employmentService
            .GetNewEntity()
            .subscribe((response: Employment) => {
                const newEmployment = response;
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
                if (this.table) {
                    this.table.addRow(newEmployment);
                    this.table.focusRow(this.employments.length - 1);
                }

            }, err => this.errorService.handle(err));
    }

    public onEmploymentChange(employment: Employment) {
        employment['_isDirty'] = true;
        let index = 0;
        if (this.employments && this.employments.length > 0) {
            index = this.employments.findIndex((emp) => {
                if (!emp.ID) {
                    return emp['_createguid'] === employment['_createguid'];
                }
                return emp.ID === employment.ID;
            });
        }
        this.employments[index] = _.cloneDeep(employment);
        this.selectedEmployment$.next(employment);
        super.updateState('employments', this.employments, true);
    }

    public onRowSelected(event) {
        const selectedIndex = event.rowModel['_originalIndex'];
        if (selectedIndex !== this.selectedIndex) {
            this.table.updateRow(this.selectedIndex, this.employments[this.selectedIndex]);
            this.selectedIndex = selectedIndex;
            this.selectedEmployment$.next(this.employments[this.selectedIndex]);
        }
    }

    public btnDisabled(): boolean {
        return this.employments && this.employments.some(e => !e.ID);
    }
}
