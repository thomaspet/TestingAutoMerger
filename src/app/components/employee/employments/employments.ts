import {RouteParams} from 'angular2/router';
import {Component, Injector, OnInit} from 'angular2/core';
import {EmployeeDS} from '../../../../framework/data/employee';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';
import {UniForm,UniFormBuilder,UniFieldBuilder,UniGroupBuilder} from '../../../../framework/forms';

declare var jQuery;

@Component({
    selector: 'employee-employment',
    directives: [UniForm],
    templateUrl: 'app/components/employee/employments/employments.html'
})
export class Employment {
    currentEmployee;
    formConfigs: UniFormBuilder[];
    
    constructor(private Injector:Injector, public employeeDS:EmployeeDS) {
        let params = Injector.parent.parent.get(RouteParams);
        employeeDS.get(params.get('id'))
        .subscribe(response => {
            this.currentEmployee = response;
            //console.log(response);
            this.buildFormConfigs();
            //console.log(this.formConfigs);
        },error => console.log(error));
    }
    
    buildFormConfigs() {
        this.formConfigs = [];
        
        this.currentEmployee.Employments.forEach((employment) => {
            
            var formbuilder = new UniFormBuilder();
            
            var jobCode = new UniFieldBuilder()
            .setLabel('stillingskode')
            .setModel(employment)
            .setModelField('JobCode')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);
        
            var jobName = new UniFieldBuilder()
            .setLabel('Navn')
            .setModel(employment)
            .setModelField('JobName')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);
            
            var startDate = new UniFieldBuilder()
            .setLabel('Startdato')
            .setModel(employment)
            .setModelField('StartDate')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DATEPICKER]);
            
            var endDate = new UniFieldBuilder()
            .setLabel('Sluttdato')
            .setModel(employment)
            .setModelField('EndDate')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DATEPICKER]);
            
            var monthRate = new UniFieldBuilder()
            .setLabel('Månedlønn')
            .setModel(employment)
            .setModelField('MonthRate')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.NUMERIC]);
            
            var hourRate = new UniFieldBuilder()
            .setLabel('Timelønn')
            .setModel(employment)
            .setModelField('HourRate')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.NUMERIC]);
            
            var workPercent = new UniFieldBuilder()
            .setLabel('Stillingprosent')
            .setModel(employment)
            .setModelField('WorkPercent')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.NUMERIC]);
            
            if(typeof employment.Localization !== "undefined") 
            {
                if(typeof employment.Localization.BusinessRelationInfo !== "undefined")
                {
                    var localization = new UniFieldBuilder()
                    .setLabel('Lokalitet')
                    .setModel(employment.Localization.BusinessRelationInfo)
                    .setModelField('Name')
                    .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);
                }
            }
            else 
            {
                var localization = new UniFieldBuilder()
                    .setLabel('Lokalitet')
                    .setModel(employment)
                    .setModelField('LocalizationID')
                    .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.NUMERIC]);
            }
            
            //group.addFields(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, localization);

        //     var readmore = new UniGroupBuilder("MER...");
        //     
        //     var salaryChanged = new UniFieldBuilder();
        //     salaryChanged.setLabel('Endret lønn')
        //     .setModel(employment)
        //     .setModelField('LastSalaryChangeDate')
        //     .setType(UNI_CONTROL_TYPES.DATEPICKER);
        // 
        //     var workpercentChange = new UniFieldBuilder();
        //     workpercentChange.setLabel('Endret stillingprosent')
        //     .setModel(employment)
        //     .setModelField('LastWorkPercentChangeDate')
        //     .setType(UNI_CONTROL_TYPES.DATEPICKER)
        //     
        //     readmore.addFields(salaryChanged, workpercentChange);
        //     
             formbuilder.addFields(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, localization);
            //formbuilder.addFields(readmore);
            
            this.formConfigs.push(formbuilder);
        });
    }
    
    onFormSubmit(event, index) {
        jQuery.merge(this.currentEmployee.Employments[index], event.value);
    }
}
