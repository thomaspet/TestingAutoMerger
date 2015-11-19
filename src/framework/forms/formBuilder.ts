import {Component, FORM_DIRECTIVES, FORM_PROVIDERS, Control, FormBuilder} from 'angular2/angular2';
import {EventEmitter, NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf} from "angular2/core";
import {UNI_CONTROL_DIRECTIVES} from '../controls';

@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, UNI_CONTROL_DIRECTIVES, NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf],
    providers: [FORM_PROVIDERS],
    outputs:['uniFormSubmit'],
    template: `
        <h1>Form Builder</h1>
        <form (submit)="onSubmit(form.value)" no-validate [ng-form-model]="form" class="col-lg-4">

            <label *ng-for="#control of controls" [ng-switch]="control.type">
                <span>{{control.label}}</span>
                <input autocomplete [ng-control]="control.field" [config]="control" *ng-switch-when="'autocomplete'" />
                <input dropdown [ng-control]="control.field" [config]="control" *ng-switch-when="'dropdown'" />
                <input combobox [ng-control]="control.field" [config]="control" *ng-switch-when="'combobox'" />
                <select multiselect [ng-control]="control.field" [config]="control" *ng-switch-when="'multiselect'"></select>
                <input datepicker [ng-control]="control.field" [config]="control" *ng-switch-when="'datepicker'">
                <input masked [ng-control]="control.field" [config]="control" *ng-switch-when="'masked'" />
                <input numeric [ng-control]="control.field" [config]="control" *ng-switch-when="'numeric'" />
                <input type="email" [ng-control]="control.field" *ng-switch-when="'email'" />
                <input type="password" [ng-control]="control.field" *ng-switch-when="'password'" />
                <!-- checkbox needs its own component with multiple selects -->
                <input type="checkbox" [ng-control]="control.field" *ng-switch-when="'checkbox'" />
                <!-- radio needs its own component with multiple selects -->
                <input type="radio" [ng-control]="control.field" *ng-switch-when="'radio'" [name]="control.field" />
                <input type="text" [ng-control]="control.field" *ng-switch-default />
                <!-- how are we going to show errors???? --->
                <small>description</small>
            </label>

            <button type="submit">submit</button>
        </form>
    `
})
export class UniForm {

    private uniFormSubmit: EventEmitter<any> = new EventEmitter<any>(true);
    private form;
    private controls;
    constructor(fb: FormBuilder) {
        if (!this.form) {
            var mockDataSource = new kendo.data.DataSource(<kendo.data.DataSourceOptions> {
                data: [
                    { id: "1", name: 'Felleskomponent' },
                    { id: "2", name: 'Regnskap' },
                    { id: "3", name: 'Faktura' },
                    { id: "4", name: 'Lønn' },
                ]
            });

            this.controls = [
                {
                    label: 'Autocomplete label',
                    type: 'autocomplete',
                    field: 'autocomplete',
                    control: new Control(),
                    kOptions: {
                        dataTextField: 'name',
                        dataSource: mockDataSource
                    }
                },
                {
                    label: 'Combobox Label',
                    type: 'combobox',
                    field: 'autocomplete',
                    control: new Control(),
                    kOptions:  {
                        delay: 50,
                        dataTextField: 'name',
                        dataValueField: 'id',
                        dataSource: mockDataSource,
                        template: '<span>#: data.id # - #: data.name #</span>'
                    }
                }
            ];



            var fbControls = {};
            for(let i=0;i<this.controls.length;i++) {
                fbControls[this.controls[i].field] = this.controls[i].control;
            }
            this.form = fb.group(fbControls);
        }
    }

    onSubmit(value){
        this.uniFormSubmit.next(value);
        return false;
    }
}
