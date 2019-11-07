import {Component, ViewChild} from '@angular/core';
import {createFormField, FieldSize, ControlTypes} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/detail';
import {Worker, WorkRelation, FieldType, Employee, User} from '../../../unientities';
import {GenericDetailview, IAfterSaveInfo, IResult} from '../genericview/detail';
import {View as RelationsSubView} from './relations';
import {View as BalancesSubView} from './balances';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ErrorService, EmployeeService, UserService} from '@app/services/services';
import {Observable} from 'rxjs';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
import {IUniTab} from '@app/components/layout/uni-tabs';

@Component({
    selector: 'workers',
    templateUrl: './worker.html'
})
export class WorkerDetailview {
    @ViewChild(GenericDetailview) private detailForm: GenericDetailview;
    @ViewChild(RelationsSubView) private relationsView: RelationsSubView;
    @ViewChild(BalancesSubView) private balancesSubView: BalancesSubView;
    public viewconfig: IViewConfig;
    public currentId: number = 0;
    private hasRelationChanges: boolean = false;
    private employees: Employee[] = [];

    public activeTabIndex: number = 0;
    public tabs: IUniTab[] = [
        {name: 'Detaljer'},
        {name: 'Saldoer'},
    ];

    constructor(
        private errorService: ErrorService,
        private employeeService: EmployeeService,
        private userService: UserService
    ) {
        this.employeeObs()
            .subscribe(emps => this.viewconfig = this.createFormConfig(emps));
    }

    public onTabActivated(index: number) {
        this.activeTabIndex = index;
        if (index === 1) {
            this.balancesSubView.activate(this.currentId);
        }
    }

    public canDeactivate() {
        return this.detailForm.canDeactivate();
    }

    public onItemChanged(item: Worker) {
        this.currentId = item.ID;
        this.hasRelationChanges = false;
        this.detailForm.flagDirty(true);
    }

    public onRelationvalueChanged(item: WorkRelation) {
        this.hasRelationChanges = true;
        this.detailForm.flagDirty(true);
    }

    public afterWorkerSaved(info: IAfterSaveInfo) {
        if (this.hasRelationChanges) {
            info.promise = new Promise( (resolve, reject) => {
                this.relationsView.saveChanges(info.entity.ID).then( (x) => {
                    this.saveOrUpdateBalanceView(info.entity.ID).then( y => resolve(y) );
                });
            });
        } else {
            info.promise = this.saveOrUpdateBalanceView(info.entity.ID);
        }
    }

    private saveOrUpdateBalanceView(workerId: number): Promise<IResult> {
        return new Promise( (resolve, reject) => {
            if (this.balancesSubView.hasUnsavedChanges()) {
                this.balancesSubView.save(true).then( success => {
                    resolve( { success: success });
                }).catch( err => {
                    reject( { success: false, msg: err ?  err.statusText : '' });
                });
            } else {
                this.balancesSubView.activate( workerId, true);
                resolve( { success: true });
            }
        });
    }

    private createFormConfig(empSource: any[]): IViewConfig {
        return {
            moduleID: UniModules.Workers,
            baseUrl: '/timetracking/workers',
            labels: {
                single: 'Person',
                plural: 'Personer',
                createNew: 'TIMETRACKING.PERSON_NEW',
                ask_delete: 'Er du sikker på at du vil slette denne personen? (Obs: Kan ikke angres)'
            },
            titleProperty: 'Info.Name',
            // tab: view,
            data: {
                model: 'worker',
                expand: 'info',
                route: 'workers',
                factory: () => {
                    return new Worker();
                },
                check: (item) => {
                },
                checkObs: (item: Worker) => {
                    if (!item.UserID || item['_userName'] || item['_userEmail']) {
                        return Observable.of(item);
                    }

                    return this.userService.Get(item.UserID).map((user: User) => {
                        if (!user) {
                            return item;
                        }
                        item['_userName'] = user.DisplayName;
                        item['_userEmail'] = user.Email;
                        return item;
                    });
                }
            },
            formFields: [
                createFormField('Info.Name', 'Navn', ControlTypes.TextInput, FieldSize.Double),
                createFormField('EmployeeID', 'Ansatt', FieldType.AUTOCOMPLETE, FieldSize.Double, false, null, null, {
                    source: empSource,
                    template: (obj: Employee) => obj && obj.EmployeeNumber
                        ? `${obj.EmployeeNumber} - ${obj.BusinessRelationInfo.Name}`
                        : '',
                    valueProperty: 'ID',
                    debounceTime: 150
                }),
                createFormField('_userName', 'Brukernavn', FieldType.TEXT, FieldSize.Double, false),
                createFormField('_userEmail', 'Bruker e-post', FieldType.TEXT, FieldSize.Double, false)
            ].map((fld: UniFieldLayout) => {
                fld.ReadOnly = fld.Property === '_userName' || fld.Property === '_userEmail';
                return fld;
            })
        };
    }

    private employeeObs(): Observable<Employee[]> {
        return this.employees.length
            ? Observable.of(this.employees)
            : this.employeeService
                .GetAll('')
                .catch((err) => Observable.of([]))
                .do(data => this.employees = data);
    }
}
