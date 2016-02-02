import {RouteParams} from 'angular2/router';
import {Component, Injector, OnInit} from 'angular2/core';
import {UniForm} from '../../../../framework/forms/uniForm';
import {EmployeeDS} from '../../../../framework/data/employee';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';
import {UniFormBuilder} from '../../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../../framework/forms/uniFieldBuilder';

@Component({
    selector: 'employee-employment',
    templateUrl: 'app/components/employee/employments/employments.html'
})
export class Employment {
    currentEmployee;
    employmentList;
    form: UniFormBuilder;
    
    constructor(private Injector:Injector, employeeDS:EmployeeDS) {
        let params = Injector.parent.parent.get(RouteParams);
        employeeDS.get(params.get('id'))
        .subscribe(response => {
            this.currentEmployee = response;
            this.employmentList = this.currentEmployee.Employments;
            
            console.log(this.currentEmployee);
            
        },error => console.log(error));
    }
    
    buildForm(employment) {
        var form = new UniFormBuilder();
    
        var jobCode = new UniFieldBuilder();
        jobCode.setLabel('stillingskode')
        .setModel(employment)
        .setModelField('jobcode')
        .setType(UNI_CONTROL_TYPES.TEXT);
    
        var jobName = new UniFieldBuilder();
        jobName.setLabel('Navn')
        .setModel(employment)
        .setModelField('jobname')
        .setType(UNI_CONTROL_TYPES.TEXT)
    
        form.addFields(jobCode, jobName);
        
        return form;
    }
    
    onsubmit(data) {
        this.employmentList = data;
    }
}
