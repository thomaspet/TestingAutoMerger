import {Component, Validators, Control} from 'angular2/angular2';
import {UniForm} from '../../../framework/forms/uniForm';

function testAsyncValidator(c) {

    let p = new Promise((resolve)=>{
        c.valueChanges.debounceTime(500).subscribe((value) => {
            if (value.name === 'Faktura') {
                resolve(null);
            } else {
                resolve({'async':true});
            }
        });
    });
    return p;
}

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm],
    template: `
        <h1>Form demo</h1>
        <uni-form (uni-form-submit)='onSubmit($event)' [config]='form'></uni-form>
    `
})
export class UniFormDemo {
    form;
    model;
    constructor() {
        this.model= {
            autocomplete:{
                id:"1",
                name:"Felleskomponent",
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
        this.form = [{
                model: self.model,
                label: 'Autocomplete label',
                type: 'autocomplete',
                field: 'autocomplete',
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
            },
            {
                model: self.model,
                label: 'Combobox Label',
                type: 'combobox',
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
                model: self.model,
                label: 'DatePicker Label',
                type: 'datepicker',
                field: 'datepicker',
                kOptions:  {}
            },
            {
                model: self.model,
                label: 'Dropdown Label',
                type: 'dropdown',
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
                model: self.model,
                label: 'Masked Label',
                type: 'masked',
                field: 'masked',
                kOptions:  {
                    mask: "0000 00 00000",
                    promptChar: '_'
                }
            },
            {
                model: self.model,
                label: 'Multiselect Label',
                type: 'multiselect',
                field: 'multiselect',
                kOptions:  {
                    delay: 50,
                    dataTextField: 'name',
                    dataValueField: 'id',
                    dataSource: new kendo.data.DataSource({data:mockDataSource})
                }
            },
            {
                model: self.model,
                label: 'Numeric Label',
                type: 'numeric',
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