import {Component, Validators, Control} from 'angular2/angular2';
import {UniForm} from '../../../framework/forms/formBuilder';
import {PromiseWrapper} from "angular2/src/facade/promise";

function testAsyncValidator(c) {
    console.log("run async validation");
    var completer = PromiseWrapper.completer();
    var t = 500;
    var res = c.value !== "Faktura" ? {"async": true} : null;

    if (t == 0) {
        completer.resolve(res);
    } else {
        setTimeout(() => {
            console.log("resolved with" + JSON.stringify(res));
            completer.resolve(res);
        }, t);
    }
    return completer.promise;
}

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm],
    template: "<h1>Form demo</h1></h1><uni-form (uni-form-submit)='onSubmit($event)' [config]='form'></uni-form>"
})
export class UniFormDemo {
    form;
    model;
    constructor() {
        this.model= {
            autocomplete:'',
            combobox: ''
        };
        var mockDataSource = new kendo.data.DataSource(<kendo.data.DataSourceOptions> {
            data: [
                { id: "1", name: 'Felleskomponent' },
                { id: "2", name: 'Regnskap' },
                { id: "3", name: 'Faktura' },
                { id: "4", name: 'Lønn' },
            ]
        });
        let self = this;
        this.form = [
            {
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
                    message: 'Autocomplete is not Faktura'
                }],
                kOptions: {
                    dataTextField: 'name',
                    dataSource: mockDataSource
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
            }
        ];
    }

    onSubmit(value) {
        console.log("Form:", value);
    }
}