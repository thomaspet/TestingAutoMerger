import {Component, Injector, ViewChild, ComponentRef} from "angular2/core";
import {RouteParams} from "angular2/router";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {
    UniFormBuilder, UniFormLayoutBuilder
} from "../../../../../framework/forms";
import {EmployeeDS} from "../../../../data/employee";
import {EmployeeModel} from "../../../../models/employee";
import {UniComponentLoader} from "../../../../../framework/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/merge";
import {UniValidator} from "../../../../../framework/validators/UniValidator";
import {OperationType, Operator, ValidationLevel} from "../../../../unientities";

declare var _;

@Component({
    selector: "employee-personal-details",
    directives: [UniComponentLoader],
    template: `
        <article class="application usertest">
            <!--<button (click)="toggleMode()">Toogle edit mode</button>-->
            <uni-component-loader></uni-component-loader>
            <!--<button type="button" (click)="executeSubmit()" [disabled]="!isValid()">Submit</button>-->
        </article>
    `
})
export class PersonalDetails {

    form: UniFormBuilder = new UniFormBuilder();
    layout;
    employee;
    subEntities;

    @ViewChild(UniComponentLoader)
    uniCmpLoader: UniComponentLoader;

    EmployeeID;
    formInstance: UniForm;

    constructor(public injector: Injector, public employeeDS: EmployeeDS) {
        var routeParams = this.injector.parent.parent.get(RouteParams); // any way to get that in an easy way????
        this.EmployeeID = routeParams.get("id");
    }

    ngAfterViewInit() {

        if(this.employeeDS.subEntities){
            console.log("SubEntities are cached");
            this.getData();
        }else{
            console.log("Caching subEntities");
            this.cacheLocAndGetData();
        }
    }
    
    cacheLocAndGetData(){
        this.employeeDS.getSubEntities().subscribe((response) => {
            this.employeeDS.subEntities = response;
            
            this.getData();
        });
    }
    
    getData(){
        var self = this;

        /*
         http.get(url).map(res => res.json())
         .flatMap(response => {
         return http.get(url2+'/'+response.param).map(res => res.json())
         .map(response2 => {
         //do whatever and return
         })
         }).subscribe()
         */
        Observable.forkJoin(
            self.employeeDS.get(this.EmployeeID),
            self.employeeDS.layout("EmployeePersonalDetailsForm")
        ).subscribe(
            (response: any) => {
                var [employee, layout] = response;
                layout.Fields[0].Validators = [{
                    "EntityType": "BusinessRelation",
                    "PropertyName": "BusinessRelationInfo.Name",
                    "Operator": Operator.Required,
                    "Operation": OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
                    "Level": ValidationLevel.Error, // not used now. All messages are errors
                    "Value": null,
                    "ErrorMessage": "Employee name is required",
                    "ID": 1,
                    "Deleted": false
                }];
                self.employee = EmployeeModel.createFromObject(employee);
                self.form = new UniFormLayoutBuilder().build(layout, self.employee);
                self.form.hideSubmitButton();
                
                self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    setTimeout(() => {
                        self.formInstance = cmp.instance;
                        console.log(self.formInstance);
                    }, 100);
                });
            }
            , (error: any) => console.error(error)
        );
    }

    isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }

    executeSubmit() {
        this.employee = _.merge(this.employee, {BusinessRelationInfo: {Name: "Jorge"}});
        this.formInstance.refresh(this.employee);
        // this.formInstance.updateModel();
    }

    toggleMode() {
        this.form.isEditable() ? this.form.readmode() : this.form.editmode();
    }
}
