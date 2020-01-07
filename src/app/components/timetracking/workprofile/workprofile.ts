import {Component, ViewChild} from '@angular/core';
import {createFormField, ControlTypes} from '../../common/utils/utils';
import {IViewConfig} from '../genericview/detail';
import {WorkProfile} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';
import {UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'workprofiles',
    template: '<genericdetail [viewconfig]="viewconfig"></genericdetail>'
})
export class WorkprofileDetailview {
    @ViewChild(GenericDetailview, { static: true }) private genericDetail: GenericDetailview;
    public viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {
        const layout: IViewConfig = {
            moduleID: UniModules.WorkProfiles,
            baseUrl: '/timetracking/workprofiles',
            labels: {
                single: 'Mal',
                plural: 'Maler',
                createNew: 'Ny mal',
                ask_delete: 'Er du sikker på at du vil slette denne malen? (Obs: Kan ikke angres)'
            },
            data: {
                model: 'workprofile',
                route: 'workprofiles',
                factory: () => new WorkProfile(),
                check: (item) => { console.log('check item', item); }
            },
            formFields: [
                createFormField('Name', 'Navn',  ControlTypes.TextInput, undefined, undefined, 1, 'Stillingsmal'),
                createFormField(
                    'MinutesPerWeek', 'Minutter pr. uke', ControlTypes.NumericInput, 0, false, 1, 'Stillingsmal'
                ),
                createFormField(
                    'LunchIncluded', 'Inkludert lunsj', ControlTypes.CheckboxInput, 0, false, 1, 'Stillingsmal'
                )
            ],
        };

        return layout;
    }

    public canDeactivate() {
        return this.genericDetail.canDeactivate();
    }
}
