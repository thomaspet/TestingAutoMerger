import {Component, ViewChild} from '@angular/core';
import {EmployeeService} from '../../../services/Salary/Employee/EmployeeService';
import {UniForm} from '../../../../framework/uniform';
import {Employee, FieldLayout} from '../../../unientities';
import {NgIf} from '@angular/common';
import {Employment} from '../../../unientities';

declare var _;

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm, NgIf],
    providers: [EmployeeService],
    template: `
        <uni-form *ngIf='employee'
            
            [config]='config' 
            [fields]='fields' 
            [model]='employee'
            
            (onSubmit)='submit($event)'
            (onChange)='change($event)'
            (onReady)='ready($event)'        
            
        ></uni-form>
    `
})
export class XFormDemo {

    public employee: Employee;
    public config: any = {};
    public fields: any[] = [];

    @ViewChild(UniForm)
    public uniform: UniForm;

    constructor(private api: EmployeeService) {
        let self = this;
        this.api.get(1).toPromise().then((employee: Employee) => self.employee = employee);
        this.api.layout('EmployeeDetailsForm').toPromise().then((layout: any) => {
            self.fields = layout.Fields;
            var numericTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 6,
                Label: 'Numeric Input test',
                Property: 'NumericTestProperty',
                ReadOnly: false,
                Options: {
                    step: 1
                }
            };
            var maskedTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 4,
                Label: 'Masked Input test',
                Property: 'MaskedTestProperty',
                ReadOnly: false,
                Options: {
                    mask: '(000) 000-0000'
                }
            };
            var multiValueTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 14,
                Label: 'Multivalue',
                Property: 'Employments',
                ReadOnly: false,
                Placeholder: 'Add new employment',
                Options: {
                    entity: Employment,
                    displayValue: 'JobName',
                    linkProperty: 'ID',
                    foreignProperty: 'DefaultJobTest',
                    editor: (value) => new Promise((resolve) => {
                        var x: Employment = new Employment();
                        x.JobName = value;
                        resolve(x);
                    })
                }
            };
            var autocompleteTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 0,
                Label: 'Autocomplete',
                Property: 'AutocompleteTest',
                ReadOnly: false,
                Placeholder: 'Autocomplete',
                Options: {
                    source: [
                        { id: 1, name: 'Jorge' },
                        { id: 2, name: 'Frank' },
                        { id: 3, name: 'Anders' },
                    ],
                    template: (obj) => `${obj.id} - ${obj.name}`, 
                    displayProperty: 'name',
                    valueProperty: 'id',
                    debounceTime: 500,
                }
            };
            var emailTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 11,
                Label: 'Email test',
                Property: 'EmailTestProperty',
                ReadOnly: false
            };
            var passwordTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 12,
                Label: 'Password test',
                Property: 'PasswodTestProperty',
                ReadOnly: false
            };
            var textareaTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 16,
                Label: 'Textarea test',
                Property: 'TextareaTestProperty',
                ReadOnly: false
            };
            var hyperlinkTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 13,
                Label: 'Hyperlink test',
                Property: 'HyperLinkProperty',
                ReadOnly: false,
                Options: {
                    description: 'Open Link'
                }
            };
            var urlTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 15,
                Label: 'Url test',
                Property: 'UrlProperty',
                ReadOnly: false
            };
            var selectTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 3,
                Label: 'Select',
                Property: 'SelectTest',
                ReadOnly: false,
                Placeholder: 'Select',
                Options: {
                    source: [
                        { id: 1, name: 'Jorge' },
                        { id: 2, name: 'Frank' },
                        { id: 3, name: 'Anders' },
                    ],
                    template: (obj) => `${obj.id} - ${obj.name}`, 
                    valueProperty: 'id',
                    displayProperty: 'name',
                    debounceTime: 500,
                }
            };
            var dateTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 2,
                Label: 'Date',
                Property: 'DateTest',
                ReadOnly: false,
                Placeholder: 'Select a date'    
            };
            var radiogroupTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 9,
                Label: 'Radio Group',
                Property: 'RadioGroupTest',
                ReadOnly: false,
                Placeholder: 'Select',
                Options: {
                    source: [
                        { id: 1, name: 'Jorge' },
                        { id: 2, name: 'Frank' },
                        { id: 3, name: 'Anders' },
                    ],
                    labelProperty: 'name', 
                    valueProperty: 'id'
                }
            };
            var checkboxgroupTest: FieldLayout = {
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 8,
                Label: 'Checkbox Group',
                Property: 'CheckboxGroupTest',
                ReadOnly: false,
                Placeholder: 'Select',
                Options: {
                    source: [
                        { id: 1, name: 'Jorge' },
                        { id: 2, name: 'Frank' },
                        { id: 3, name: 'Anders' },
                    ],
                    labelProperty: 'name', 
                    valueProperty: 'id'
                }
            };
            self.fields = [
                numericTest, 
                maskedTest, 
                multiValueTest, 
                autocompleteTest, 
                emailTest,
                passwordTest,
                hyperlinkTest,
                urlTest,
                textareaTest,
                selectTest,
                radiogroupTest,  
                dateTest,   
                checkboxgroupTest,       
                ...self.fields];
        });
        this.config = {
            submitText: 'Enviar'
        };
    }

    public submit(value) {
        console.log('Submit:', value);
    }

    public ready(value) {
        console.log('Ready:', value);
        var self = this;
        
        setTimeout(() => {
            self.api.get(2).toPromise().then((employee: any) => {
                self.employee = employee;
            });
        }, 1000);
        setTimeout(() => {
            self.uniform.section(1).toggle();
        }, 2000);
        setTimeout(() => {
            self.employee.BusinessRelationInfo.Name = 'Jorge Ferrando';
            self.employee = _.cloneDeep(self.employee);
        }, 3000);
        setTimeout(() => {
            self.uniform.readMode();
        }, 4000);
        setTimeout(() => {
            self.uniform.editMode();
        }, 5000);
        setTimeout(() => {
            self.uniform.Hidden = true;
        }, 6000);
        setTimeout(() => {
            self.uniform.Hidden = false;
        }, 7000);
        setTimeout(() => {
            self.uniform.section(1).Hidden = true;
        }, 8000);
        setTimeout(() => {
            self.uniform.section(1).Hidden = false;
        }, 9000);
        setTimeout(() => {
            self.uniform.Fields['Employments'].focus();
        }, 10000);
        
        self.uniform.Fields['NumericTestProperty'].onTab.subscribe((element) => {
            self.uniform.Fields['UrlProperty'].focus();
        });
    }

public change(value) {
        console.log('Change:', value);
    }
}