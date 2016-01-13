import {Component} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {UniForm,FIELD_TYPES} from '../../../framework/forms/uniForm';

import {UNI_CONTROL_TYPES} from '../../../framework/controls/types';

import 'rxjs/add/observable/fromEvent';
import {UniFormBuilder} from "../../../framework/forms/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../framework/forms/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../framework/forms/uniFieldBuilder";

import {TabService} from '../navbar/tabstrip/tabService';

function testAsyncValidator(control) {
    let p = new Promise((resolve)=>{
        setTimeout(()=>{
            if (control.value.name === 'Faktura') {
                resolve(null);
            } else {
                resolve({'async':true});
            }
        },500);
    });
    p.catch((e)=>console.error(e));
    return p;
}
function test2(c) {
    return new Promise((r)=>{
        setTimeout(()=>{
            r(null);
        },1000);
    });
}

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm],
    template: `
        <h1>Form demo</h1>
        <uni-form (uniFormSubmit)='onSubmit($event)' [fields]='form'></uni-form>
    `
})
export class UniFormDemo {
    form;
    model;
    constructor(fb:FormBuilder, private tabService: TabService) {
        this.tabService.addTab({name: 'UniFormDemo', url: '/uniformdemo'});
        this.model= {
            autocomplete:{
                id:"1",
                name:"Felleskomponent",
            },
            autocomplete2:{
                id:"1",
                name:"Felleskomponent",
            },
            deep: {
                autocomplete: {
                    id:"1",
                    name:"Felleskomponent",
                }
            },
            combobox: '2',
            datepicker: new Date(),
            dropdown: '3',
            masked: '',
            multiselect: ["1","2"],
            numeric: '10'
        };
        let mockDataSource = [
            { id: "1", name: 'Felleskomponent' },
            { id: "2", name: 'Regnskap' },
            { id: "3", name: 'Faktura' },
            { id: "4", name: 'Lønn' },
        ];
        let self = this;

        var uniFormBuilder = new UniFormBuilder();
        var autocompleteField = new UniFieldBuilder();
        autocompleteField.setType(UNI_CONTROL_TYPES.AUTOCOMPLETE)
        .setLabel('Autocomplete label')
        .setModel(self.model)
        .setModelField('autocomplete')
        .setKendoOptions({
            dataTextField: 'name',
            dataSource: new kendo.data.DataSource({data:mockDataSource})
        })
        .addSyncValidator('required',Validators.required,'field is required')
        .addAsyncValidator('async',testAsyncValidator,'Autocomplete should be "Faktura"')

        this.form = [
            {
                fieldType: FIELD_TYPES.GROUP,
                title: "Group",
                fields: [{
                    fieldType: FIELD_TYPES.FIELD,
                    model: self.model,
                    label: 'Autocomplete label',
                    type: UNI_CONTROL_TYPES.AUTOCOMPLETE,
                    field: 'deep.autocomplete',
                    syncValidators: [
                        {
                            name: 'required',
                            validator: Validators.required,
                            message: 'field is required'
                        }
                    ],
                    asyncValidators: [{
                        name: 'async',
                        validator:testAsyncValidator,
                        message: 'Autocomplete should be Faktura'
                    }],
                    kOptions: {
                        dataTextField: 'name',
                        dataSource: new kendo.data.DataSource({data:mockDataSource})
                    }
                }]
            },
            {
                fieldType: FIELD_TYPES.FIELDSET,
                legend: 'Fieldset',
                fields: [{
                    fieldType: FIELD_TYPES.FIELD,
                    model: self.model,
                    label: 'Autocomplete label',
                    type: UNI_CONTROL_TYPES.AUTOCOMPLETE,
                    field: 'autocomplete2',
                    syncValidators: [
                        {
                            name: 'required',
                            validator: Validators.required,
                            message: 'field is required'
                        }
                    ],
                    asyncValidators: [{
                        name: 'async',
                        validator:testAsyncValidator,
                        message: 'Autocomplete should be Faktura'
                    }],
                    kOptions: {
                        dataTextField: 'name',
                        dataSource: new kendo.data.DataSource({data:mockDataSource})
                    }
                }]
            },
            autocompleteField,
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'Combobox Label',
                type: UNI_CONTROL_TYPES.COMBOBOX,
                field: 'combobox',
                kOptions:  {
                    delay: 50,
                    dataTextField: 'name',
                    dataValueField: 'id',
                    dataSource: mockDataSource,
                    template: '<span>#: data.id # - #: data.name #</span>'
                }
            },
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'DatePicker Label',
                type: UNI_CONTROL_TYPES.DATEPICKER,
                field: 'datepicker',
                kOptions:  {}
            },
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'Dropdown Label',
                type: UNI_CONTROL_TYPES.DROPDOWN,
                field: 'dropdown',
                kOptions:  {
                    delay: 50,
                    dataTextField: 'name',
                    dataValueField: 'id',
                    dataSource: new kendo.data.DataSource({data:mockDataSource}),
                    template: '<span>#: data.id # - #: data.name #</span>'
                }
            },
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'Masked Label',
                type: UNI_CONTROL_TYPES.MASKED,
                field: 'masked',
                kOptions:  {
                    mask: "0000 00 00000",
                    promptChar: '_'
                }
            },
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'Multiselect Label',
                type: UNI_CONTROL_TYPES.MULTISELECT,
                field: 'multiselect',
                kOptions:  {
                    delay: 50,
                    dataTextField: 'name',
                    dataValueField: 'id',
                    dataSource: new kendo.data.DataSource({data:mockDataSource})
                }
            },
            {
                fieldType: FIELD_TYPES.FIELD,
                model: self.model,
                label: 'Numeric Label',
                type: UNI_CONTROL_TYPES.NUMERIC,
                field: 'numeric',
                kOptions:  {
                    format: '#', // http://docs.telerik.com/kendo-ui/framework/globalization/numberformatting
                    min: 0,
                    max: 100,
                    step: 10
                }
            }
        ];
    }

    onSubmit(value) {
        console.log("Form:", value);
        console.log("Model:", this.model);
    }
}