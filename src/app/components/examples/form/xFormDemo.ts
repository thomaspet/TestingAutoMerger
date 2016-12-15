import {Component, ViewChild} from '@angular/core';
import {EmployeeService} from '../../../services/Salary/Employee/EmployeeService';
import {UniForm} from 'uniform-ng2/main';
import {UniFieldLayout} from 'uniform-ng2/main';
import {Employee, Employment, FieldType} from '../../../unientities';

declare var _;

@Component({
    selector: 'uni-form-demo-2',
    template: `
        <uni-form *ngIf='employee'
            
            [config]='config' 
            [fields]='fields' 
            [model]='employee'
            
            (submitEvent)='submit($event)'
            (changeEvent)='change($event)'
            (readyEvent)='ready($event)'        
            
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
            var numericTest = new UniFieldLayout();
            numericTest.FieldSet = 0;
            numericTest.Section = 0;
            numericTest.Combo = 0;
            numericTest.FieldType = FieldType.NUMERIC;
            numericTest.Label = 'Numeric Input test';
            numericTest.Property = 'NumericTestProperty';
            numericTest.ReadOnly = false;
            numericTest.LineBreak = true;
            numericTest.Options = {
                step: 1,
                events: {
                    tab: ((event) => {
                        this.uniform.field('UrlProperty').focus();
                    }).bind(this)
                }
            };
            var maskedTest = new UniFieldLayout();
            maskedTest.FieldSet = 0;
            maskedTest.Section = 0;
            maskedTest.Combo = 0;
            maskedTest.FieldType = FieldType.MASKED;
            maskedTest.Label = 'Masked Input test';
            maskedTest.Property = 'MaskedTestProperty';
            maskedTest.ReadOnly = false;
            maskedTest.Options = {
                mask: '(000) 000-0000'
            };
            var multiValueTest = new UniFieldLayout();
            multiValueTest.FieldSet = 0;
            multiValueTest.Section = 0;
            multiValueTest.Combo = 0;
            multiValueTest.FieldType = FieldType.MULTIVALUE;
            multiValueTest.Label = 'Multivalue';
            multiValueTest.Property = 'Employments';
            multiValueTest.ReadOnly = false;
            multiValueTest.Placeholder = 'Add new employment';
            multiValueTest.Options = {
                entity: Employment,
                displayValue: 'JobName',
                linkProperty: 'ID',
                storeResultInProperty: 'DefaultJobTest',
                //editor: (value) => new Promise((resolve) => {
                //    if(_.isObject(value) && value.hasOwnProperty('JobName')) {
                //        value.JobName = 'Edited JobName';
                //        resolve(value);
                //    } else {
                //        var x: Employment = new Employment();
                //        x.ID = _.toSafeInteger(performance.now());
                //        x.JobName = 'New Job';
                //        resolve(x);
                //    }
                //})
            };
            var autocompleteTest = new UniFieldLayout();
            autocompleteTest.FieldSet = 0;
            autocompleteTest.Section = 0;
            autocompleteTest.Combo = 0;
            autocompleteTest.FieldType = FieldType.AUTOCOMPLETE;
            autocompleteTest.Label = 'Autocomplete';
            autocompleteTest.Property = 'AutocompleteTest';
            autocompleteTest.ReadOnly = false;
            autocompleteTest.Placeholder = 'Autocomplete';
            autocompleteTest.Options = {
                source: [
                    { id: 1, name: 'Jorge' },
                    { id: 2, name: 'Frank' },
                    { id: 3, name: 'Anders' },
                ],
                template: (obj) =>  {
                    return obj ? `${obj.id} - ${obj.name}` : '';
                },
                displayProperty: 'name',
                valueProperty: 'id',
                debounceTime: 500,
                editor: (value, cmp) => {
                    const result = confirm('Editing value: ' + value);
                    return new Promise((resolve, reject) => {
                        return result ? resolve(result) : reject(result);
                    });
                }
            };
            
            var emailTest = new UniFieldLayout();
            emailTest.FieldSet = 0;
            emailTest.Section = 0;
            emailTest.Combo = 0;
            emailTest.FieldType = FieldType.EMAIL;
            emailTest.Label = 'Email test';
            emailTest.Property = 'EmailTestProperty';
            emailTest.ReadOnly = false;
            
            var passwordTest = new UniFieldLayout();
            passwordTest.FieldSet = 0;
            passwordTest.Section = 0;
            passwordTest.Combo = 0;
            passwordTest.FieldType = FieldType.PASSWORD;
            passwordTest.Label = 'Password test';
            passwordTest.Property = 'PasswodTestProperty';
            passwordTest.ReadOnly = false;
            
            var textareaTest = new UniFieldLayout();
            textareaTest.FieldSet = 0;
            textareaTest.Section = 0;
            textareaTest.Combo = 0;
            textareaTest.FieldType = FieldType.TEXTAREA;
            textareaTest.Label = 'Textarea test';
            textareaTest.Property = 'TextareaTestProperty';
            textareaTest.ReadOnly = false;
            
            var hyperlinkTest = new UniFieldLayout();
            hyperlinkTest.FieldSet = 0;
            hyperlinkTest.Section = 0;
            hyperlinkTest.Combo = 0;
            hyperlinkTest.FieldType = FieldType.HYPERLINK;
            hyperlinkTest.Label = 'Hyperlink test';
            hyperlinkTest.Property = 'HyperLinkProperty';
            hyperlinkTest.ReadOnly = false;
            hyperlinkTest.Options = {
                description: 'Open Link'
            };
            
            var urlTest = new UniFieldLayout();
            urlTest.FieldSet = 0;
            urlTest.Section = 0;
            urlTest.Combo = 0;
            urlTest.FieldType = FieldType.URL;
            urlTest.Label = 'Url test';
            urlTest.Property = 'UrlProperty';
            urlTest.ReadOnly = false;
            
            var selectTest = new UniFieldLayout();
            selectTest.FieldSet = 0;
            selectTest.Section = 0;
            selectTest.Combo = 0;
            selectTest.FieldType = FieldType.DROPDOWN;
            selectTest.Label = 'Select';
            selectTest.Property = 'SelectTest';
            selectTest.ReadOnly = false;
            selectTest.Placeholder = 'Select';
            selectTest.Options = {
                source: [
                    { id: 1, name: 'Jorge' },
                    { id: 2, name: 'Frank' },
                    { id: 3, name: 'Anders' },
                ],
                template: (obj) => `${obj.id} - ${obj.name}`, 
                valueProperty: 'id',
                displayProperty: 'name',
                debounceTime: 500,
            };
            
            var dateTest = new UniFieldLayout();
            dateTest.FieldSet = 0;
            dateTest.Section = 0;
            dateTest.Combo = 0;
            dateTest.FieldType = FieldType.LOCAL_DATE_PICKER;
            dateTest.Label = 'Date';
            dateTest.Property = 'DateTest';
            dateTest.ReadOnly = false;
            dateTest.Placeholder = 'Select a date';
            
            var radiogroupTest = new UniFieldLayout();
            radiogroupTest.FieldSet = 0;
            radiogroupTest.Section = 0;
            radiogroupTest.Combo = 0;
            radiogroupTest.FieldType = FieldType.RADIOGROUP;
            radiogroupTest.Label = 'Radio Group';
            radiogroupTest.Property = 'RadioGroupTest';
            radiogroupTest.ReadOnly = false;
            radiogroupTest.Placeholder = 'Select';
            radiogroupTest.Options = {
                source: [
                    { id: 1, name: 'Jorge' },
                    { id: 2, name: 'Frank' },
                    { id: 3, name: 'Anders' },
                ],
                labelProperty: 'name', 
                valueProperty: 'id'
            };
            var checkboxgroupTest = new UniFieldLayout();
            checkboxgroupTest.FieldSet = 0;
            checkboxgroupTest.Section = 0;
            checkboxgroupTest.Combo = 0;
            checkboxgroupTest.FieldType = FieldType.CHECKBOX;
            checkboxgroupTest.Label = 'Checkbox Group';
            checkboxgroupTest.Property = 'CheckboxGroupTest';
            checkboxgroupTest.ReadOnly = false;
            checkboxgroupTest.Placeholder = 'Select';
            checkboxgroupTest.Options = {
                multivalue: false,
                source: [
                    { id: 1, name: 'Jorge' },
                    { id: 2, name: 'Frank' },
                    { id: 3, name: 'Anders' },
                ],
                labelProperty: 'name', 
                valueProperty: 'id'
            };

            var buttonTest = new UniFieldLayout();
            buttonTest.FieldSet = 0;
            buttonTest.Section = 0;
            buttonTest.Combo = 0;
            buttonTest.FieldType = FieldType.COMBOBOX;
            buttonTest.Label = 'Click here!';
            buttonTest.ReadOnly = false;
            buttonTest.Options = {
                click: (event) => {
                    alert('clicked!');
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
                buttonTest,
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
            self.uniform.field('Employments').focus();
        }, 10000);
    }

public change(value) {
        console.log('Change:', value);
    }
}
