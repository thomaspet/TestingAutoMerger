import {Component, ViewChild} from "angular2/core";
import {EmployeeService} from "../../../services/Salary/Employee/EmployeeService";
import {UniForm} from "../../../../framework/xforms/uniform";
import {Employee} from "../../../unientities";
import {Observable} from "rxjs/Observable";
import {NgIf} from "angular2/common";
import {FieldLayout} from "../../../unientities";

declare var _;

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm, NgIf],
    providers: [EmployeeService],
    template: `
        <uni-form *ngIf="employee"
            
            [config]="config" 
            [fields]="fields" 
            [model]="employee"
            
            (onSubmit)="submit($event)"
            (onChange)="change($event)"
            (onReady)="ready($event)"        
            
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
            self.fields = layout.Fields.filter((field: FieldLayout) => field.FieldType === 10);
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
            self.api.get(2).toPromise().then((employee: any) => self.employee = employee);
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
    }

    public change(value) {
        console.log('Change:', value);
    }
}