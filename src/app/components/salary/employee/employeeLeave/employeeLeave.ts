import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Employment, Employee, EmployeeLeave} from '../../../../unientities';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {UniCacheService, ErrorService} from '../../../../services/services';
import {UniView} from '../../../../../framework/core/uniView';

@Component({
    selector: 'employee-permision',
    templateUrl: './employeeLeave.html'

})
export class EmployeeLeaves extends UniView {
    private employee: Employee;
    private employeeID: number;
    private employments: Employment[] = [];
    private employeeleaveItems: EmployeeLeave[] = [];
    private tableConfig: UniTableConfig;
    private unsavedEmployments: boolean;

    private leaveTypes: any[] = [
        { typeID: '1', text: 'Permisjon' },
        { typeID: '2', text: 'Permittering' }
    ];

    constructor(
        router: Router,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);

            this.employeeID = +paramsChange['id'];

            super.getStateSubject('employee')
                .subscribe(
                    employee => this.employee = employee,
                    err => this.errorService.handle(err)
                );
            super.getStateSubject('employeeLeave')
                .subscribe(
                    employeeleave => this.employeeleaveItems = employeeleave,
                    err => this.errorService.handle(err)
                );

            super.getStateSubject('employments').subscribe((employments: Employment[]) => {
                this.employments = (employments || []).filter(emp => emp.ID > 0);
                this.unsavedEmployments = this.employments.length !== employments.length;
                this.buildTableConfig();
            }, err => this.errorService.handle(err));
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

    public buildTableConfig() {
        const fromDateCol = new UniTableColumn('FromDate', 'Startdato', UniTableColumnType.LocalDate);
        const toDateCol = new UniTableColumn('ToDate', 'Sluttdato', UniTableColumnType.LocalDate);
        const leavePercentCol = new UniTableColumn('LeavePercent', 'Prosent', UniTableColumnType.Percent);
        const commentCol = new UniTableColumn('Description', 'Kommentar');
        const leaveTypeCol = new UniTableColumn('LeaveType', 'Type', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                if (!dataItem.LeaveType && !dataItem['_isEmpty']) {
                    dataItem.LeaveType = 1;
                }
                const leaveType = this.leaveTypes.find(lt => +lt.typeID === +dataItem.LeaveType);
                return (leaveType) ? leaveType.text : '';
            })
            .setEditorOptions({
                itemTemplate: selectedItem => selectedItem.text,
                lookupFunction: (searchValue) => {
                    return this.leaveTypes.filter(lt => lt.text.toLowerCase().indexOf(searchValue) > -1);
                },

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

        this.tableConfig = new UniTableConfig(this.employeeID ? true : false)
            .setDeleteButton(true)
            .setColumns([
                fromDateCol, toDateCol, leavePercentCol,
                leaveTypeCol, employmentIDCol, commentCol
            ])
            .setChangeCallback((event) => {
                let row: EmployeeLeave = event.rowModel;
                if (event.field === 'Employment') {
                    this.mapEmploymentToPermision(row);
                } else if (this.employments && !row.ID && !row['_isDirty']) {
                    row.Employment = this.employments.find(x => x.Standard);
                    row['LeaveType'] = this.leaveTypes[0].typeID;
                    row.EmploymentID = row.Employment ? row.Employment.ID : undefined;
                }

                if (event.field === 'LeaveType') {
                    this.mapLeavetypeToPermision(row);
                }

                // Update local array and cache
                row['_isDirty'] = true;
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

    private onRowDeleted(event) {
        let row: EmployeeLeave = event.rowModel;
        if (row['_isEmpty']) {
            return;
        }
        let deletedIndex = row['_originalIndex'];
        let hasDirtyRow = true;
        if (this.employeeleaveItems[deletedIndex].ID) {
            this.employeeleaveItems[deletedIndex].Deleted = true;
        } else {
            this.employeeleaveItems.splice(deletedIndex, 1);
            hasDirtyRow = this.employeeleaveItems.some(x => x['_isDirty']);
        }

        super.updateState('employeeLeave', this.employeeleaveItems, hasDirtyRow);
    }
}
