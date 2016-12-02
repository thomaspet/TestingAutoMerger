import {Component, ViewChild} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkProfile} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

export var view = new View('workprofiles', 'Stillingsmal', 'WorkprofileDetailview', true, '', WorkprofileDetailview);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>'
})
export class WorkprofileDetailview {
    @ViewChild(GenericDetailview) private genericDetail: GenericDetailview;
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
            moduleID: UniModules.WorkProfiles,
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

    public canDeactivate() {
        return this.genericDetail.canDeactivate();
    }
}
