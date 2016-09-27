import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Employment, Employee} from '../../../../unientities';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {EmployeeLeaveService, EmployeeService, EmploymentService, UniCacheService} from '../../../../services/services';
import {UniView} from '../../../../../framework/core/uniView';

@Component({
    selector: 'employee-permision',
    templateUrl: 'app/components/salary/employee/employeeLeave/employeeLeave.html',
    directives: [UniTable, UniSave],
    providers: [EmployeeLeaveService],
    pipes: [AsyncPipe]
})
export class EmployeeLeave extends UniView implements OnInit {
    private employee: Employee;
    private employments: Employment[] = [];
    private employeeleaveItems: any[] = [];
    private permisionTableConfig: UniTableConfig;


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
            disabled: false
        }
    ];

    constructor(private employeeService: EmployeeService,
                private employmentService: EmploymentService,
                private employeeleaveService: EmployeeLeaveService,
                private route: ActivatedRoute,
                private uniHttp: UniHttp,
                router: Router,
                cacheService: UniCacheService) {

        super(router.url, cacheService);
    }

    public ngOnInit() {
        this.route.parent.params.subscribe(params => {
            let employeeID = +params['id'];
            this.buildTableConfig();

            let employeeSubject = super.getStateSubject('employee');
            let employmentSubject = super.getStateSubject('employments');
            let employeeLeaveSubject = super.getStateSubject('employeeleave');

            // If we're the first one to subscribe to any of the subjects
            // we need to get data from backend and update the subjects ourselves
            if (!employeeSubject.observers.length) {
                this.employeeService.get(employeeID).subscribe((employee: Employee) => {
                    this.employee = employee;
                    super.updateState('employee', employee, false);
                });
            }

            if (!employmentSubject.observers.length) {
                this.employmentService.GetAll(`filter=EmployeeID eq ${employeeID}`)
                    .subscribe((employments: Employment[]) => {
                        super.updateState('employments', employments, false);
                    });
            }

            employeeSubject.subscribe(employee => this.employee = employee);
            employeeLeaveSubject.subscribe(employeeleave => this.employeeleaveItems = employeeleave);

            employmentSubject.subscribe((employments: Employment[]) => {
                this.employments = employments;

                // Get employeeleave if we didnt already get it from cache
                if (!this.employeeleaveItems.length) {
                    this.uniHttp.asGET()
                    .usingBusinessDomain()
                    .withEndPoint('employeeleave')
                    .send({
                        filter: this.buildFilter()
                    })
                    .subscribe((response) => {
                        this.employeeleaveItems = response.json();
                        super.updateState('employeeleave', this.employeeleaveItems, false);
                    });
                }
            });
        });
    }

    // REVISIT (remove)!
    // This (and the canDeactivate in employeeRoutes.ts) is a dummy-fix
    // until we are able to locate a problem with detecting changes of
    // destroyet view in unitable.
    public canDeactivate() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            });
        });
    }

    public buildFilter() {
        let filterParts = ['EmploymentID eq 0'];
        this.employments.forEach((employment: Employment) => {
            filterParts.push(`EmploymentID eq ${employment.ID}`);
        });

        return filterParts.join(' or ');
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

        this.permisionTableConfig = new UniTableConfig()
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

                // Update local array and cache
                this.employeeleaveItems[row['_originalIndex']] = row;
                super.updateState('employeeleave', this.employeeleaveItems, true);

                return row;
            });
    }

    public saveLeave(done) {
        let saveSources = [];
        this.employeeleaveItems.forEach((employeeleave) => {
            if (employeeleave['_isDirty']) {
                let source = (employeeleave.ID > 0)
                    ? this.employeeleaveService.Put(employeeleave.ID, employeeleave)
                    : this.employeeleaveService.Post(employeeleave);

                saveSources.push(source);
            }
        });

        Observable.forkJoin(saveSources).subscribe(
            res => {
                done('Lagring fullført');
                super.updateState('employeeleave', this.employeeleaveItems, false);
            },
            err => {
                done('Feil ved lagring av permisjoner');
                this.log(err);
            }
        );
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

    public log(err) {
        alert(err._body);
    }
}
