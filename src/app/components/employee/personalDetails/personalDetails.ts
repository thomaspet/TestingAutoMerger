import {Validators} from 'angular2/common';
import {Component, Injector, ViewChild, DynamicComponentLoader, ElementRef, ComponentRef, Type} from 'angular2/core';
import {RouteParams} from 'angular2/router';

import {UniForm} from '../../../../framework/forms/uniForm';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {
    UniFormBuilder, UniFieldBuilder, UniFieldsetBuilder, UniGroupBuilder, UniFormLayoutBuilder
} from '../../../../framework/forms';

import {EmployeeDS} from '../../../../framework/data/employee';
import {EmployeeModel} from '../../../../framework/models/employee';
import {UniComponentLoader} from '../../../../framework/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';

declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    template: `
        <div class="application employee">
            <button (click)="toggleMode()">Toogle edit mode</button>
            <uni-component-loader></uni-component-loader>
            <button type="button" (click)="executeSubmit()" [disabled]="!isValid()">Submit</button>
        </div>
    `
})
export class PersonalDetails {

    form:UniFormBuilder = new UniFormBuilder();
    layout;
    employee;

    @ViewChild(UniComponentLoader)
    uniCmpLoader:UniComponentLoader;

    EmployeeID;
    formInstance:UniForm;

    constructor(public injector:Injector, public employeeDS:EmployeeDS) {
        var routeParams = this.injector.parent.parent.get(RouteParams);//Any way to get that in an easy way????
        this.EmployeeID = routeParams.get('id');
    }

    ngAfterViewInit() {

        var self = this;
        Observable.forkJoin(
            self.employeeDS.get(this.EmployeeID),
            self.employeeDS.layout('EmployeePersonalDetailsForm')
        ).subscribe(
            response => {
                var [employee,layout] = response;
                self.employee = EmployeeModel.createFromObject(employee);
                self.form = new UniFormLayoutBuilder().build(layout, self.employee);
                self.form.hideSubmitButton();

                self.uniCmpLoader.load(UniForm, (cmp:ComponentRef)=> {
                    cmp.instance.config = self.form;
                    setTimeout(()=> {
                        self.formInstance = cmp.instance;
                    }, 100);
                });
            },
            error => console.error(error)
        );
    }

    isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }

    executeSubmit() {
        this.employee = _.merge({},this.employee,{BusinessRelationInfo:{Name:"Jorge"}});
        this.formInstance.refresh(this.employee);
        console.log(this.employee);
        //this.formInstance.updateModel();
    }

    toggleMode() {
        this.form.isEditable() ? this.form.readmode() : this.form.editmode();
    }
}