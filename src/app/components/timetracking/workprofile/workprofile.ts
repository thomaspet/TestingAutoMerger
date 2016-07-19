import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkProfile} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';

export var view = new View('workprofile', 'Stillingsmal', 'WorkprofileDetailview', true, '', WorkprofileDetailview);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>',
    directives: [GenericDetailview]
})
export class WorkprofileDetailview {
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
            moduleID: 15,
            labels: { single: 'Mal', plural: 'Maler', createNew: 'Ny mal'},
            detail: { routeBackToList: '/timetracking/workprofiles'},
            tab: view,
            data: {
                model: 'workprofile',
                route: 'workprofiles',
                factory: () => { return new WorkProfile(); },
                check: (item) => { console.log('check item', item); }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, FieldSize.Double),
                createFormField('MinutesPerWeek', 'Minutter pr. uke', ControlTypes.NumericInput, 0, false, 1, 'Innstillinger' ),
                createFormField('LunchIncluded', 'Inkludert lunsj', ControlTypes.CheckboxInput, 0, false, 1)
            ],
        };

        return layout;
    }   

}
