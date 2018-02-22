import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Employment, EmployeeLeave, Leavetype, LocalDate} from '../../../../unientities';
import {UniTableConfig, UniTableColumnType, UniTableColumn, IRowChangeEvent, UniTable} from '../../../../../framework/ui/unitable/index';
import {UniCacheService, ErrorService, EmployeeLeaveService} from '../../../../services/services';
import {UniView} from '../../../../../framework/core/uniView';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'employee-permision',
    templateUrl: './employeeLeave.html'

})
export class EmployeeLeaves extends UniView {
    private employeeID: number;
    private employments: Employment[] = [];
    private employeeleaveItems: EmployeeLeave[] = [];
    private tableConfig: UniTableConfig;
    private unsavedEmployments$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        router: Router,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private employeeLeaveService: EmployeeLeaveService
    ) {
        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.unsavedEmployments$.next(false);

            this.employeeID = +paramsChange['id'];

            super.getStateSubject('employeeLeave')
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
                    this.buildTableConfig();
                }, err => this.errorService.handle(err));
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
                    dataItem.LeaveType = Leavetype.Leave;
                }
                const leaveType = this.employeeLeaveService.getOnlyNewTypes().find(lt => +lt.ID === +dataItem.LeaveType);
                return leaveType ? leaveType.text : leaveType === undefined && dataItem.ID > 0 ? 'Permisjon' : '';
            })
            .setOptions({
                itemTemplate: selectedItem => selectedItem.text,
                lookupFunction: (searchValue) => {
                    return this.employeeLeaveService.getOnlyNewTypes().filter(lt => lt.text.toLowerCase().indexOf(searchValue) > -1);
                },

            });

        const employmentIDCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                let employment = this.employments.find(e => e.ID === dataItem.EmploymentID);
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

        this.tableConfig = new UniTableConfig('salary.employee.employeeLeave', this.employeeID ? true : false)
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
                    row['LeaveType'] = this.employeeLeaveService.getOnlyNewTypes()[0].ID;
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

    private lookupEmployment(searchValue): Employment[] {
        return this.employments
            .filter(employment => isNaN(searchValue)
                ? employment.JobName.indexOf(searchValue) > -1
                : employment.ID.toString().startsWith(searchValue));
    }

    private mapEmploymentToPermision(rowModel) {
        let employment = rowModel['Employment'];
        rowModel['EmploymentID'] = employment ? employment.ID : 0;
    }

    private mapLeavetypeToPermision(rowModel) {
        let leavetype = rowModel['LeaveType'];
        if (!leavetype) {
            return;
        }
        rowModel['LeaveType'] = leavetype.ID;
    }

    public rowChanged(event: IRowChangeEvent) {
        if (event.field === 'LeaveType') {
            if (event['newValue'] === null) {
                this.employeeleaveItems[event['originalIndex']].LeaveType = Leavetype.Leave;
            }
        }
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
