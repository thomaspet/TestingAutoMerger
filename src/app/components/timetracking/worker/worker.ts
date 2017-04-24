import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/list';
import {Worker, WorkRelation} from '../../../unientities';
import {GenericDetailview, IAfterSaveInfo, IResult} from '../genericview/detail';
import {View as RelationsSubView} from './relations';
import {View as BalancesSubView} from './balances';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('workers', 'Person', 'WorkerDetailview', true, '', WorkerDetailview);

@Component({
    selector: view.name,
    templateUrl: './worker.html'
})
export class WorkerDetailview {
    @ViewChild(GenericDetailview) private detailForm: GenericDetailview;
    @ViewChild(RelationsSubView) private relationsView: RelationsSubView;
    @ViewChild(BalancesSubView) private balancesSubView: BalancesSubView;
    private viewconfig: IViewConfig;
    private currentId: number = 0;
    private hasRelationChanges: boolean = false;

    public tabs: Array<any> = [ { name: 'details', label: 'Detaljer', isSelected: true },
            { name: 'balances', label: 'Saldoer',
                activate: (ts: any, filter: any) => {
                    this.balancesSubView.activate(this.currentId);
                }
            }
        ];

    constructor() {
        this.viewconfig = this.createFormConfig();
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

    public onTabClick(tab: any) {
        if (tab.isSelected) { return; }
        this.tabs.forEach((t: any) => {
            if (t.name !== tab.name) { t.isSelected = false; }
        });
        tab.isSelected = true;
        if (tab.activate) {
            tab.activate();
            tab.activated = true;
        }
    }

    private createFormConfig(): IViewConfig {
        return {
            moduleID: UniModules.Workers,
            labels: { single: view.label, plural: 'Personer', createNew: 'Ny person'},
            detail: { routeBackToList: '/timetracking/workers', nameProperty: 'Info.Name'},
            tab: view,
            data: {
                model: 'worker',
                expand: 'info',
                route: 'workers',
                factory: () => {
                        var item = new Worker();
                        return item;
                    },
                check: (item) => {
                }
            },
            formFields: [
                createFormField('Info.Name', 'Navn',  ControlTypes.TextInput, FieldSize.Double),
            ]
        };
    }

}
