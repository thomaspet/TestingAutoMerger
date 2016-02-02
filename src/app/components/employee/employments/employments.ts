import {RouteParams} from 'angular2/router';
import {Component, Injector, OnInit} from 'angular2/core';
import {UniForm} from '../../../../framework/forms/uniForm';
import {EmployeeDS} from '../../../../framework/data/employee';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';
import {UniFormBuilder} from '../../../../framework/forms/uniFormBuilder';
import {UniFieldBuilder} from '../../../../framework/forms/uniFieldBuilder';
import {UniGroupBuilder} from '../../../../framework/forms/uniGroupBuilder';

declare var jQuery;

@Component({
    selector: 'employee-employment',
    directives: [UniForm],
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
            console.log(response);
            this.buildGroupConfigs();
        },error => console.log(error));
    }
    
    buildGroupConfigs() {
        var formbuilder = new UniFormBuilder();
        this.employmentList.forEach((employment) => {
            var group = new UniGroupBuilder(employment.JobName);
    
            var jobCode = new UniFieldBuilder();
            jobCode.setLabel('stillingskode')
            .setModel(employment)
            .setModelField('JobCode')
            .setType(UNI_CONTROL_TYPES.TEXT);
        
            var jobName = new UniFieldBuilder();
            jobName.setLabel('Navn')
            .setModel(employment)
            .setModelField('JobName')
            .setType(UNI_CONTROL_TYPES.TEXT)
            
            var startDate = new UniFieldBuilder();
            startDate.setLabel('Startdato')
            .setModel(employment)
            .setModelField('StartDate')
            .setType(UNI_CONTROL_TYPES.DATEPICKER)
            
            var monthRate = new UniFieldBuilder();
            monthRate.setLabel('Månedlønn')
            .setModel(employment)
            .setModelField('MonthRate')
            .setType(UNI_CONTROL_TYPES.NUMERIC)
            
            var hourRate = new UniFieldBuilder();
            hourRate.setLabel('Timelønn')
            .setModel(employment)
            .setModelField('HourRate')
            .setType(UNI_CONTROL_TYPES.NUMERIC)
            
            var workPercent = new UniFieldBuilder();
            workPercent.setLabel('Stillingprosent')
            .setModel(employment)
            .setModelField('WorkPercent')
            .setType(UNI_CONTROL_TYPES.NUMERIC)
            
            var localization = new UniFieldBuilder();
            localization.setLabel('Lokalitet')
            .setModel(employment)
            .setModelField('LocalizationID')
            .setType(UNI_CONTROL_TYPES.NUMERIC)
        
            group.addFields(jobCode, jobName, startDate, monthRate, hourRate, workPercent, localization);
            
            formbuilder.addField(group);
            
            this.form = formbuilder;
        });
    }
    
    onFormSubmit(event, index) {
        jQuery.merge(this.employmentList[index], event.value);
    }
}
