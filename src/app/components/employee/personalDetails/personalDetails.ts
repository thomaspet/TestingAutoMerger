import {Validators} from 'angular2/common';
import {Component, Injector, ViewChild, DynamicComponentLoader, ElementRef, ComponentRef, Type} from 'angular2/core';
import {RouteParams} from 'angular2/router';

import {UniForm} from '../../../../framework/forms/uniForm';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

import {UniFormBuilder} from '../../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../../framework/forms/uniFieldBuilder';
import {UniFieldsetBuilder} from '../../../../framework/forms/uniFieldsetBuilder';
import {UniGroupBuilder} from '../../../../framework/forms/uniGroupBuilder';
import {UniLayoutBuilder} from '../../../../framework/forms/uniLayoutBuilder';
import {EmployeeDS} from '../../../../framework/data/employee';
import {EmployeeModel} from '../../../../framework/models/employee';
import {UniComponentLoader} from '../../../../framework/core/componentLoader';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';

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
    @ViewChild(UniComponentLoader) ucl:UniComponentLoader;
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
                self.employee = EmployeeModel.createFromObject(response[0]);
                self.form = new UniLayoutBuilder().build(response[1], self.employee);
                self.form.hideSubmitButton();

                self.ucl.load(UniForm, (cmp:ComponentRef)=> {
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
        this.formInstance.updateModel();
        console.log(this.formInstance.form.value)
    }

    toggleMode() {
        this.form.isEditable() ? this.form.readmode() : this.form.editmode();
    }
}