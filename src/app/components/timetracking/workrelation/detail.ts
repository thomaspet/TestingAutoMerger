import {Component} from '@angular/core';
import {View} from '../../../models/view/view';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';
import {IViewConfig} from '../genericview/list';
import {WorkRelation} from '../../../unientities';
import {GenericDetailview} from '../genericview/detail';

export var view = new View('timetracking/workrelations', 'Arbeidsforhold', 'WorkrelationDetailview', true, '', WorkrelationDetailview);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>',
    directives: [GenericDetailview]
})
export class WorkrelationDetailview {
    private viewconfig: IViewConfig;
    constructor() {
        this.viewconfig = this.createLayout();
    }

    private createLayout(): IViewConfig {

        var layout: IViewConfig = {
            moduleID: 16,
            labels: { single: 'Arbeidsforhold', plural: 'Arbeidsforhold', createNew: 'Nytt arbeidsforhold'},
            detail: { routeBackToList: undefined, nameProperty: 'Description' },
            tab: view,
            data: {
                model: 'workrelation',
                route: 'workrelations',
                factory: () => { return new WorkRelation(); },
                check: (item) => { console.log('check item', item); },
                expand: 'workprofile'
            },
            formFields: [
                createFormField('CompanyName', 'Firmanavn',  ControlTypes.TextInput),
                createFormField('Description', 'Beskrivelse',  ControlTypes.TextInput, FieldSize.Double),
                createFormField('StartDate', 'Startdato',  ControlTypes.DateInput, 0, false, 1, 'Innstillinger'),
                createFormField('IsActive', 'Aktivt arbeidsforhold',  ControlTypes.CheckboxInput, 0, false, 1),
                createFormField('WorkPercentage', 'Stillingsprosent',  ControlTypes.NumericInput, 0, false, 1),
                createFormField('WorkProfile', 'Stillingsmal', ControlTypes.SelectInput, 0, false, 2, 'Mal')
            ],
        };

        return layout;
    }   

}
