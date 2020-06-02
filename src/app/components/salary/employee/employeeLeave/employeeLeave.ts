import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import { EmployeeLeaveService } from '@app/components/salary/employee/shared/services/employeeLeaveService';
import { UniView } from '@uni-framework/core/uniView';
import { Employment, EmployeeLeave, CompanySalary, Leavetype } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType, IRowChangeEvent } from '@uni-framework/ui/unitable';
import { UniCacheService, ErrorService, CompanySalaryService } from '@app/services/services';
const EMPLOYEE_LEAVE_KEY = 'employeeLeave';

@Component({
    selector: 'employee-permision',
    templateUrl: './employeeLeave.html'

})
export class EmployeeLeaves extends UniView {
    private employeeID: number;
    private employments: Employment[] = [];
    public employeeleaveItems: EmployeeLeave[] = [];
    public tableConfig: UniTableConfig;
    public unsavedEmployments$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private companysalarySettings: CompanySalary;

    constructor(
        router: Router,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private employeeLeaveService: EmployeeLeaveService,
        private companysalaryService: CompanySalaryService
    ) {
        super(router.url, cacheService);

        this.companysalaryService.getCompanySalary()
            .subscribe(compsalsetting => {
                this.companysalarySettings = compsalsetting;
                this.buildTableConfig();
            });

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.unsavedEmployments$.next(false);

            this.employeeID = +paramsChange['id'];

            super.getStateSubject(EMPLOYEE_LEAVE_KEY)
                .subscribe(
                employeeleave => this.employeeleaveItems = employeeleave,
                err => this.errorService.handle(err)
                );

            super.getStateSubject('employments')
                .do((employments: Employment[]) => {
                    this.unsavedEmployments$
                        .next(employments.some(emp => !emp.ID) && super.isDirty('employments'));
                })
                .subscribe((employments: Employment[]) => {
                    this.employments = (employments || []).filter(emp => emp.ID > 0);
                }, err => this.errorService.handle(err));
        });
    }

    public buildTableConfig() {
        const fromDateCol = new UniTableColumn('FromDate', 'Startdato', UniTableColumnType.LocalDate);
        const toDateCol = new UniTableColumn('ToDate', 'Sluttdato', UniTableColumnType.LocalDate);
        const leavePercentCol = new UniTableColumn('LeavePercent', 'Prosent', UniTableColumnType.Percent);
        const commentCol = new UniTableColumn('Description', 'Kommentar');
        const leaveTypeCol = new UniTableColumn('LeaveType', 'Type', UniTableColumnType.Lookup)
            .setTemplate((dataItem: EmployeeLeave) => {

                const leaveType = dataItem.LeaveType !== null
                    ? this.employeeLeaveService.getOnlyNewTypes().find(lt => +lt.ID === +dataItem.LeaveType)
                    : null;

                if (!leaveType && dataItem.LeaveType === Leavetype.Leave) {
                    return 'Permisjon';
                }

                return leaveType && leaveType.text;
            })
            .setOptions({
                itemTemplate: selectedItem => selectedItem.text,
                lookupFunction: (searchValue) => {
                    return this.employeeLeaveService.getOnlyNewTypes().filter(lt => lt.text.toLowerCase().indexOf(searchValue) > -1);
                },
            });

        const employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                const employment = this.employments.find(e => e.ID === dataItem.EmploymentID);
                return employment
                    ? employment.JobName ? `${employment.ID} - ${employment.JobName}` : employment.ID.toString()
                    : '';
            })
            .setOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => this.lookupEmployment(searchValue)
            });
        const affectsOTPCol = new UniTableColumn('_AffectsOtp', 'Påvirker OTP', UniTableColumnType.Select)
            .setWidth('15%')
            .setTemplate((row: EmployeeLeave) => {
                if (row['_isEmpty']) {
                    return '';
                }
                if (row && row.AffectsOtp) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            })
            .setOptions({
                resource: ['Ja', 'Nei'],
                itemTemplate: rowModel => rowModel
            });

        const columns = [fromDateCol, toDateCol, leavePercentCol, leaveTypeCol, employmentIDCol, commentCol];
        if (this.companysalarySettings && this.companysalarySettings.OtpExportActive) {
            columns.push(affectsOTPCol);
        }

        this.tableConfig = new UniTableConfig('salary.employee.employeeLeave', this.employeeID ? true : false)
            .setDeleteButton(true)
            .setColumns(columns)
            .setChangeCallback((event) => {
                const row: EmployeeLeave = event.rowModel;
                if (event.field === '_Employment') {
                    this.mapEmploymentToPermision(row);
                } else if (this.employments && !row.ID && !row['_isDirty']) {
                    row.Employment = this.employments.find(x => x.Standard);
                    row.LeaveType = row.LeaveType || Leavetype.NotSet;
                    row.EmploymentID = row.Employment ? row.Employment.ID : undefined;
                }

                if (event.field === 'LeaveType') {
                    this.mapLeavetypeToPermision(row);
                }

                if (event.field === '_AffectsOtp') {
                    if (row['_AffectsOtp'] === 'Ja') {
                        row.AffectsOtp = true;
                    } else {
                        row.AffectsOtp = false;
                    }
                }

                // Update local array and cache
                row['_isDirty'] = true;
                this.employeeleaveItems[row['_originalIndex']] = row;
                super.updateState(EMPLOYEE_LEAVE_KEY, this.employeeleaveItems, true);

                return row;
            });
    }

    private lookupEmployment(searchValue): Employment[] {
        return this.employments
            .filter(employment => isNaN(searchValue)
                ? employment.JobName.indexOf(searchValue) > -1
                : employment.ID.toString().startsWith(searchValue));
    }

    private mapEmploymentToPermision(rowModel) {
        const employment = rowModel['_Employment'];
        rowModel['Employment'] = employment;
        rowModel['EmploymentID'] = employment ? employment.ID : 0;
    }

    private mapLeavetypeToPermision(rowModel) {
        const leavetype = rowModel['LeaveType'];
        if (!leavetype) {
            rowModel['LeaveType'] = Leavetype.NotSet;
            return;
        }
        rowModel['LeaveType'] = leavetype.ID;
    }

    public rowChanged(event: IRowChangeEvent) {
        if (event.field === 'LeaveType') {
            if (event['newValue'] === null) {
                this.employeeleaveItems[event['originalIndex']].LeaveType = Leavetype.NotSet;
            }
        }
    }

    public onRowDeleted(row: EmployeeLeave) {
        if (row['_isEmpty']) {
            return;
        }
        const hasDirtyRow = this.employeeleaveItems.some(x => x['_isDirty'] || x.Deleted);
        super.updateState(EMPLOYEE_LEAVE_KEY, this.employeeleaveItems, hasDirtyRow);
    }
}
