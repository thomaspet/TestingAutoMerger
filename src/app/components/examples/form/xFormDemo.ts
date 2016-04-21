import {Component} from "angular2/core";
import {EmployeeService} from "../../../services/Salary/Employee/EmployeeService";
import {UniForm} from "../../../../framework/xforms/uniform";
import {Employee} from "../../../unientities";
import {Observable} from "rxjs/Observable";
import {NgIf} from "angular2/common";

declare var _;

@Component({
    selector: 'uni-form-demo',
    directives: [UniForm, NgIf],
    providers: [EmployeeService],
    template: `
        <uni-form 
            
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

    public employee: Observable<Employee>;
    public config: any = {};
    public fields: any[] = [];

    constructor(private Api: EmployeeService) {
        let self = this;
        this.Api.get(1).toPromise().then((employee:any) => self.employee = employee);
        this.Api.layout("EmployeeDetailsForm").toPromise().then((layout: any) => {
            self.fields = layout.Fields;
        });
        this.config = {
            submitText: "Enviar"
        };
        setTimeout(()=>{
            this.Api.get(1).toPromise().then((employee:any) => self.employee = employee);
        },1000)
    }

    public submit(value) {
        console.log("Submit:", value);
    }

    public ready(value) {
        console.log("Ready:", value);
    }

    public change(value) {
        console.log("Change:", value);
    }
}