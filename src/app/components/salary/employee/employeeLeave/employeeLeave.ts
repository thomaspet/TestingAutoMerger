import {Component, OnInit, ViewChild} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';
import {EmployeeDS} from '../../../../data/employee';
import {Employment, Employee} from '../../../../unientities';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {EmployeeLeaveService} from '../../../../services/services';

@Component({
    selector: 'employee-permision',
    templateUrl: 'app/components/salary/employee/employeeLeave/employeeLeave.html',
    directives: [UniTable, UniSave],
    providers: [EmployeeLeaveService],
    pipes: [AsyncPipe]
})
export class EmployeeLeave implements OnInit {

    private currentEmployee: Employee;
    private employments: Employment[];
    private employeeID: number;
    private permisionTableConfig: UniTableConfig;
    private permisions$: Observable<any>;
    private permisionsChanged: any[];
    @ViewChild(UniTable) private table: UniTable;

    private leaveTypes: any[] = [
        { typeID: '0', text: 'Ikke satt' },
        { typeID: '1', text: 'Permisjon' },
        { typeID: '2', text: 'Permittering' }
    ];

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre permisjoner',
            action: this.saveLeave.bind(this),
            main: true,
            disabled: true
        }
    ];

    constructor(private routeParams: RouteParams, public employeeDS: EmployeeDS, private rootRouteParams: RootRouteParamsService, private uniHttp: UniHttp, private employeeleaveService: EmployeeLeaveService) {
        this.employeeID = +rootRouteParams.params.get('id');
    }

    public ngOnInit() {
        this.buildTableConfig();

        this.employeeDS
            .get(this.employeeID)
            .subscribe((response: any) => {
                this.currentEmployee = response;
                this.employments = this.currentEmployee.Employments;

                let filter = this.buildFilter();
                this.permisions$ = this.uniHttp.asGET()
                        .usingBusinessDomain()
                        .withEndPoint('employeeleave')
                        .send({
                            filter: filter
                        });

            }, (error) => this.log(error));
    }

    public buildFilter() {
        // gives empty list if employee has no employments
        var filter = 'EmploymentID eq 0 or';
        this.employments.forEach((employment: Employment) => {
            filter += ' EmploymentID eq ' + employment.ID + ' or';
        });
        filter = filter.slice(0, filter.length - 2);

        return filter;
    }

    public buildTableConfig() {
        // var idCol = new UniTableColumn('ID', 'ID', UniTableColumnType.Number, false);
        var fromDateCol = new UniTableColumn('FromDate', 'Startdato', UniTableColumnType.Date);
        var toDateCol = new UniTableColumn('ToDate', 'Sluttdato', UniTableColumnType.Date);
        var leavePercentCol = new UniTableColumn('LeavePercent', 'Prosent', UniTableColumnType.Number)
            .setFormat(`{0: #\\'%'}`);
        var commentCol = new UniTableColumn('Description', 'Kommentar', UniTableColumnType.Text);
        var leaveTypeCol = new UniTableColumn('LeaveType', 'Type', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return this.getLeaveTypeText(dataItem.LeaveType);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.typeID + ' - ' + selectedItem.text);
                },
                lookupFunction: (searchValue) => {
                    let matching: any[] = [];
                    this.leaveTypes.forEach(leavetype => {
                        if (leavetype.text.toLowerCase().indexOf(searchValue) > -1) {
                            matching.push(leavetype);
                        }
                    });
                    return matching;
                }
            });

        var employmentIDCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return this.getEmploymentJobName(dataItem.EmploymentID);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    let matching: Employment[] = [];
                    this.employments.forEach(employment => {
                        if (employment.JobName.toLowerCase().indexOf(searchValue) > -1) {
                            matching.push(employment);
                        }
                    });
                    return matching;
                }
            });

        this.permisionTableConfig = new UniTableConfig()
            .setColumns([
                // idCol, 
                fromDateCol, toDateCol, leavePercentCol,
                leaveTypeCol, employmentIDCol, commentCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === 'Employment') {
                    this.mapEmploymentToPermision(row);
                }

                if (event.field === 'LeaveType') {
                    this.mapLeavetypeToPermision(row);
                }

                return row;
            });
    }

    public saveLeave(done) {
        done('Lagrer permisjoner');
        this.permisionsChanged.forEach(permisionItem => {

            console.log('permisjonsItem', permisionItem);

            if (permisionItem.ID > 0) {
                this.employeeleaveService.Put(permisionItem.ID, permisionItem)
                    .subscribe((response: EmployeeLeave) => {
                        done('Sist lagret: ');
                    },
                    (err) => {
                        done('Feil ved oppdatering av permisjon', err);
                        this.log(err);
                    });
            } else {
                this.employeeleaveService.Post(permisionItem)
                    .subscribe((response: EmployeeLeave) => {
                        done('Sist lagret: ');

                    },
                    (err) => {
                        done('Feil ved lagring av permisjon', err);
                        this.log(err);
                    });
            }
        });
        done('Permisjoner lagret: ');
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

    private getLeaveTypeText(typeID: string) {
        var text = '';

        this.leaveTypes.forEach((leaveType) => {
            if (leaveType.typeID === typeID) {
                text = leaveType.text;
            }
        });

        return text;
    }

    private getEmploymentJobName(employmentID: number) {
        var jobName = '';

        this.employments.forEach((employment: Employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
            }
        });

        return jobName;
    }

    private rowChanged(event) {
        this.permisionsChanged = this.table.getTableData();
        this.saveactions[0].disabled = false;
    }

    public log(err) {
        alert(err._body);
    }
}
