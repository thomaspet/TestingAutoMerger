import {Component, ViewChild, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniChildView} from '../../../../../framework/core/uniView';
import {EmploymentService, EmployeeService} from '../../../../services/services';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {EmploymentDetails} from './employmentDetails';
import {Employee, Employment} from '../../../../unientities';

import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {UniCacheService} from '../../../../services/services';

@Component({
    selector: 'employments',
    templateUrl: 'app/components/salary/employee/employments/employments.html',
    directives: [UniTable, EmploymentDetails, UniSave],
    providers: [EmploymentService]
})
export class Employments extends UniChildView implements OnInit {
    @ViewChild(UniTable)
    private table: UniTable;

    private employee: Employee;
    private employments: Employment[] = [];
    private selectedIndex: number = 0;

    private busy: boolean;
    private tableConfig: UniTableConfig;
    private saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre arbeidsforhold',
            action: this.saveEmployments.bind(this),
            main: true,
            disabled: true
        }
    ];

    constructor(private employmentService: EmploymentService,
                private employeeService: EmployeeService,
                private route: ActivatedRoute,
                private toastService: ToastService,
                cacheService: UniCacheService,
                router: Router) {

        super(router.url, cacheService);
    }

    public ngOnInit() {
        this.employee = super.getStateVar('employee');
        this.employments = super.getStateVar('employments') || [];

        this.route.parent.params.subscribe((params) => {
            const employeeID = +params['id'];

            // Get employee if not cached
            if (!this.employee) {
                this.employeeService.get(employeeID).subscribe((employee: Employee) => {
                    this.employee = employee;
                    super.setStateVar('employee', employee, false);
                });
            }

            // Focus standard employment, get employments and focus if they werent cached
            if (this.employments.length) {
                const focusIndex = this.employments.findIndex(employment => employment.Standard) || 0;
                this.table.focusRow(focusIndex);
            } else {
                this.employmentService.GetAll('filter=EmployeeID eq ' + employeeID).subscribe((employments) => {
                    super.setStateVar('employments', employments, false);
                    this.employments = employments;

                    const focusIndex = this.employments.findIndex(employment => employment.Standard) || 0;
                    this.table.focusRow(focusIndex);

                    if (!this.employments.length) {
                        this.newEmployment();
                    }
                });
            }
        });

        this.tableConfig = new UniTableConfig(false).setColumns([
            new UniTableColumn('ID', 'Nr', UniTableColumnType.Number).setWidth('4rem'),
            new UniTableColumn('JobName', 'Stillingsnavn'),
            new UniTableColumn('JobCode', 'Stillingskode')
        ]);
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
        this.saveActions[0].disabled = false;

        // Store state in case the user leaves the view without saving
        super.setStateVar('employments', this.employments, true);
    }

    private onRowSelected(event) {
        // Update table when switching rows
        const currentEmployment = this.employments[this.selectedIndex];
        if (currentEmployment['_isDirty']) {
            this.table.updateRow(this.selectedIndex, currentEmployment);
        }

        this.selectedIndex = event.rowModel['_originalIndex'];
    }

    // REVISIT: This should be moved to parent component
    // when cache is implemented for all employee components
    private saveEmployments(done) {
        this.busy = true;

        // Remove untouched new rows
        this.employments = this.employments.filter((employment, index) => {
            if (employment.ID === 0 && !employment['_isDirty']) {
                this.table.removeRow(index);
                return false;
            }

            return true;
        });

        // Find changed rows and check if we have a standard employment
        const changes = [];
        let hasStandardEmployment = false;
        this.employments.forEach((employment) => {
            if (employment['_isDirty']) {
                changes.push(employment);
            }

            if (employment['Standard']) {
                hasStandardEmployment = true;
            }
        });

        // Make current employment standard if not already set
        if (!hasStandardEmployment) {
            this.employments[this.selectedIndex].Standard = true;
        }

        // Save changes
        let finishedCount = 0;
        changes.forEach((employment: Employment) => {
            let source = (employment.ID > 0) ? this.employmentService.Put(employment.ID, employment)
                                             : this.employmentService.Post(employment);

            // Use Observable.finally() to track save progress
            source = source.finally(() => {
                finishedCount++;

                if (finishedCount === changes.length) {
                    // If no employments _isDirty it means every save request was successful
                    if (this.employments.filter(emp => emp['_isDirty']).length === 0) {
                        this.saveActions[0].disabled = true;
                        done('Lagring fullført');
                    } else {
                        done('Feil under lagring');
                    }

                    this.busy = false;
                }
            });

            // Perform request
            source.subscribe(
                response => this.handleSaveSuccess(employment, response),
                error => this.handleSaveError(employment)
            );
        });

    }

    private handleSaveSuccess(employment, response) {
        this.table.updateRow(employment['_originalIndex'], response);
        this.employments[employment['_originalIndex']] = response;
    }

    private handleSaveError(employment) {
        // TODO: Set validation feedback in table when this is supported
        this.toastService.addToast('Lagring av arbeidsforhold ' + employment.JobName + ' feilet', ToastType.bad, 0);
    }

}
