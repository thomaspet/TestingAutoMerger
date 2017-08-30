import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkType} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {SYSTEMTYPES} from '../../common/utils/pipes';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('worktypes', 'Timeart', 'WorktypeDetailview', true, '', WorktypeDetailview);

var defaultSystemType = 1; // 1 - Hours (default)

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig"></genericdetail>'
})
export class WorktypeDetailview {
    @ViewChild(GenericDetailview) private genericDetail: GenericDetailview;
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    public canDeactivate() {
        return this.genericDetail.canDeactivate();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
            moduleID: UniModules.WorkTypes,
            labels: {
                single: 'Mal',
                plural: 'Maler',
                createNew: 'Ny Timeart',
                ask_delete: 'Er du sikker på at du vil slette denne timearten? (Obs: Kan ikke angres)'
            },
            detail: { routeBackToList: '/timetracking/worktypes'},
            tab: view,
            data: {
                model: 'worktype',
                route: 'worktypes',
                factory: () => {
                        var item = new WorkType();
                        item.SystemType = defaultSystemType;
                        return item;
                    },
                check: (item) => {
                    item.SystemType = item.SystemType || defaultSystemType;
                }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, undefined, undefined, 1, 'Timeart'),
                createFormField('SystemType', 'Type', 3, undefined, false, 1, 'Timerart', {
                    source: SYSTEMTYPES, valueProperty: 'id', displayProperty: 'label'
                }),
                createFormField('Description', 'Kommentar', ControlTypes.TextareaInput, undefined, true, 1, 'Timart')
            ],
        };

        return layout;
    }

}
