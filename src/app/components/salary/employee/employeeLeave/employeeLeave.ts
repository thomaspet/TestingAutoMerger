import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Employment, Employee} from '../../../../unientities';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {UniCacheService} from '../../../../services/services';

import {UniView} from '../../../../../framework/core/uniView';

@Component({
    selector: 'employee-permision',
    templateUrl: 'app/components/salary/employee/employeeLeave/employeeLeave.html'

})
export class EmployeeLeave extends UniView {
    private employee: Employee;
    private employments: Employment[] = [];
    private employeeleaveItems: any[] = [];
    private tableConfig: UniTableConfig;

    private leaveTypes: any[] = [
        { typeID: '0', text: 'Ikke satt' },
        { typeID: '1', text: 'Permisjon' },
        { typeID: '2', text: 'Permittering' }
    ];

    constructor(router: Router, route: ActivatedRoute, cacheService: UniCacheService) {
        super(router.url, cacheService);
        this.buildTableConfig();

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);

            super.getStateSubject('employee').subscribe(employee => this.employee = employee);
            super.getStateSubject('employeeLeave').subscribe(employeeleave => this.employeeleaveItems = employeeleave);

            super.getStateSubject('employments').subscribe((employments: Employment[]) => {
                this.employments = employments || [];

                if (this.employments && this.employments.find(employment => !employment.ID)) {
                    this.tableConfig.setEditable(false);
                } else {
                    this.tableConfig.setEditable(true);
                }
            });
        });
    }

    // REVISIT (remove)!
    // This (and the canDeactivate in employeeRoutes.ts) is a dummy-fix
    // until we are able to locate a problem with detecting changes of
    // destroyed view in unitable.
    public canDeactivate() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            });
        });
    }

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    public buildTableConfig() {
        const fromDateCol = new UniTableColumn('FromDate', 'Startdato', UniTableColumnType.Date);
        const toDateCol = new UniTableColumn('ToDate', 'Sluttdato', UniTableColumnType.Date);
        const leavePercentCol = new UniTableColumn('LeavePercent', 'Prosent', UniTableColumnType.Number)
            .setTemplate((rowModel) => {
                const leavePercent = rowModel['LeavePercent'];
                return (leavePercent) ? leavePercent + '%' : '';
            });

        const commentCol = new UniTableColumn('Description', 'Kommentar');
        const leaveTypeCol = new UniTableColumn('LeaveType', 'Type', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                const leaveType = this.leaveTypes.find(lt => lt.ID === dataItem.LeaveType);
                return (leaveType) ? leaveType.text : '';
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.typeID + ' - ' + selectedItem.text);
                },
                lookupFunction: (searchValue) => {
                    return this.leaveTypes.filter(lt => lt.text.toLowerCase().indexOf(searchValue) > -1);
                }
            });

        const employmentIDCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                let employment = this.employments.find(e => e.ID === dataItem.EmploymentID);
                return (employment) ? employment.JobName : '';
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    return this.employments.filter(employment => employment.JobName.toLowerCase().indexOf(searchValue) > -1);
                }
            });

        this.tableConfig = new UniTableConfig()
            .setColumns([
                fromDateCol, toDateCol, leavePercentCol,
                leaveTypeCol, employmentIDCol, commentCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;
                row['_isDirty'] = true;

                if (event.field === 'Employment') {
                    this.mapEmploymentToPermision(row);
                }

                if (event.field === 'LeaveType') {
                    this.mapLeavetypeToPermision(row);
                }

                if (event.field === 'FromDate' && row['FromDate']) {
                    row['FromDate'] = this.fixTimezone(row['FromDate']);
                }

                if (event.field === 'ToDate' && row['ToDate']) {
                    row['ToDate'] = this.fixTimezone(row['ToDate']);
                }

                // Update local array and cache
                this.employeeleaveItems[row['_originalIndex']] = row;
                super.updateState('employeeLeave', this.employeeleaveItems, true);

                return row;
            });
    }

    private mapEmploymentToPermision(rowModel) {
        let employment = rowModel['Employment'];
        if (!employment) {
            return;
        }
        rowModel['EmploymentID'] = employment.ID;
    }

    private mapLeavetypeToPermision(rowModel) {
        let leavetype = rowModel['LeaveType'];
        if (!leavetype) {
            return;
        }
        rowModel['LeaveType'] = leavetype.typeID;
    }
}
