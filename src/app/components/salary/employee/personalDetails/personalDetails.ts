import {Component, Injector, ViewChild, ComponentRef} from "angular2/core";
import {RouteParams} from "angular2/router";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {
    UniFormBuilder, UniFormLayoutBuilder
} from "../../../../../framework/forms";
import {EmployeeDS} from "../../../../../framework/data/employee";
import {EmployeeModel} from "../../../../../framework/models/employee";
import {UniComponentLoader} from "../../../../../framework/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/merge";

declare var _;

@Component({
    selector: "employee-personal-details",
    directives: [UniComponentLoader],
    template: `
        <div class="application employee">
            <!--<button (click)="toggleMode()">Toogle edit mode</button>-->
            <uni-component-loader></uni-component-loader>
            <!--<button type="button" (click)="executeSubmit()" [disabled]="!isValid()">Submit</button>-->
        </div>
    `
})
export class PersonalDetails {

    form: UniFormBuilder = new UniFormBuilder();
    layout;
    employee;
    localizations;

    @ViewChild(UniComponentLoader)
    uniCmpLoader: UniComponentLoader;

    EmployeeID;
    formInstance: UniForm;

    constructor(public injector: Injector, public employeeDS: EmployeeDS) {
        var routeParams = this.injector.parent.parent.get(RouteParams); // any way to get that in an easy way????
        this.EmployeeID = routeParams.get("id");
    }

    ngAfterViewInit() {

        var self = this;
        if(self.employeeDS.localizations){
            console.log("Localizations are cached");
            self.getData();
        }else{
            console.log("Caching localizations");
            self.cacheLocAndGetData();
        }
    }
    
    cacheLocAndGetData(){
        var self = this;
        self.employeeDS.getLocalizations().subscribe((response) => {
            self.employeeDS.localizations = response;
            
            self.getData();
        });
    }
    
    getData(){
        var self = this;
        Observable.forkJoin(
            self.employeeDS.get(this.EmployeeID),
            self.employeeDS.layout("EmployeePersonalDetailsForm")
        ).subscribe(
            (response: any) => {
                var [employee, layout] = response;
                self.employee = EmployeeModel.createFromObject(employee);
                self.form = new UniFormLayoutBuilder().build(layout, self.employee);
                self.form.hideSubmitButton();
                
                self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    setTimeout(() => {
                        self.formInstance = cmp.instance;
                    }, 100);
                });
            },
            (error: any) => console.error(error)
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
