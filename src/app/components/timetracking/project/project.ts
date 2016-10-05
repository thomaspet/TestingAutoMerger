import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {Project} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('projects', 'Prosjekt', 'ProjectDetailview', true, '', ProjectDetailview);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>'
})
export class ProjectDetailview {
    public viewconfig: IViewConfig;

    constructor() {
        this.viewconfig = {
            moduleID: UniModules.Projects,
            labels: { single: 'Prosjekt', plural: 'Prosjekter', createNew: 'Nytt Prosjekt'},
            detail: { routeBackToList: '/timetracking/projects', nameProperty: 'Name'},
            tab: view,
            data: {
                model: 'project',
                route: 'projects',
                factory: () => {
                        var item = new Project();
                        return item;
                    },
                check: (item) => {
                }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, FieldSize.Double),
                createFormField('ProjectLeadName', 'Prosjektleder',  ControlTypes.TextInput, FieldSize.Quarter),
                createFormField('Description', 'Kommentar', ControlTypes.TextareaInput, FieldSize.Full, true, 1, 'Kommentar')
            ]
        };
    }
}
