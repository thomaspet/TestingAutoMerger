import {Component, Injector, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams} from 'angular2/router';

import {UniForm} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';

import {UniFormBuilder} from '../../../../../framework/forms';
import {FieldType} from '../../../../unientities';
import {EmployeeModel} from '../../../../models/employee';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {UniSectionBuilder} from '../../../../../framework/forms/builders/uniSectionBuilder';
import {UniFieldBuilder} from '../../../../../framework/forms/builders/uniFieldBuilder';
import {Employment, Employee} from '../../../../unientities';
import {EmployeeService} from '../../../../services/services';

declare var jQuery;

@Component({
    selector: 'employee-hours',
    directives: [UniComponentLoader, UniForm],
    providers: [EmployeeService],
    templateUrl: 'app/components/salary/employee/hours/hours.html'
})
export class Hours {
    private currentEmployee: Employee;
    private form: UniFormBuilder = new UniFormBuilder();
    @ViewChild(UniComponentLoader) 
    private ucl: UniComponentLoader;
    private employeeID: any;
    private formInstance: UniForm;

    constructor(private _injector: Injector, public _employeeService: EmployeeService) {
        // let params = Injector.parent.parent.get(RouteParams);
        // employeeDS.get(params.get('id'))
        // .subscribe(response => {
        //     this.currentEmployee = response;
        //     console.log(response);
        //     this.buildGroupConfigs();
        // },error => console.log(error));

        let params = _injector.parent.parent.get(RouteParams);
        this.employeeID = params.get('id');
    }

    public ngAfterViewInit() {

        var self = this;
        Observable.forkJoin(
            self._employeeService.get(this.employeeID),
            self._employeeService.layout('EmployeeEmploymentsForm')
        ).subscribe(
            (response: any) => {
                self.currentEmployee = EmployeeModel.createFromObject(response[0]);

                self.form = self.buildGroupConfigs();
                self.form.hideSubmitButton();

                self.ucl.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    setTimeout(() => {
                        self.formInstance = cmp.instance;
                    }, 100);

                });
            },
            (error: any) => console.error(error)
        );
    }

    private buildGroupConfigs() {
        var formbuilder = new UniFormBuilder();
        this.currentEmployee.Employments.forEach((employment: Employment) => {
            var group = new UniSectionBuilder(employment.JobName);

            // if(employment.Standard) {
            //     group.openByDefault(true);
            // }

            var jobCode = new UniFieldBuilder()
                .setLabel('stillingskode')
                .setModel(employment)
                .setModelField('JobCode')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var jobName = new UniFieldBuilder()
                .setLabel('Navn')
                .setModel(employment)
                .setModelField('JobName')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

            var startDate = new UniFieldBuilder()
                .setLabel('Startdato')
                .setModel(employment)
                .setModelField('StartDate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var endDate = new UniFieldBuilder()
                .setLabel('Sluttdato')
                .setModel(employment)
                .setModelField('EndDate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var monthRate = new UniFieldBuilder()
                .setLabel('Månedlønn')
                .setModel(employment)
                .setModelField('MonthRate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

            var hourRate = new UniFieldBuilder()
                .setLabel('Timelønn')
                .setModel(employment)
                .setModelField('HourRate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

            var workPercent = new UniFieldBuilder()
                .setLabel('Stillingprosent')
                .setModel(employment)
                .setModelField('WorkPercent')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
                
            var subEntity = new UniFieldBuilder();
            
            if (typeof employment.SubEntity) {
                if (typeof employment.SubEntity.BusinessRelationInfo) {
                    subEntity
                        .setLabel('Lokalitet')
                        .setModel(employment.SubEntity.BusinessRelationInfo)
                        .setModelField('Name')
                        .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
                }
            } else {
                subEntity
                    .setLabel('Lokalitet')
                    .setModel(employment)
                    .setModelField('SubEntityID')
                    .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
            }

            group.addUniElements(jobCode, jobName, startDate, endDate,
                                 monthRate, hourRate, workPercent, subEntity);

            var readmore = new UniSectionBuilder('VIS MER...');

            var salaryChanged = new UniFieldBuilder()
                .setLabel('Endret lønn')
                .setModel(employment)
                .setModelField('LastSalaryChangeDate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            var workpercentChange = new UniFieldBuilder()
                .setLabel('Endret stillingprosent')
                .setModel(employment)
                .setModelField('LastWorkPercentChangeDate')
                .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

            readmore.addUniElements(salaryChanged, workpercentChange);

            formbuilder.addUniElement(group);
            formbuilder.addUniElements(readmore);
        });
        this.form = formbuilder;
        return formbuilder;
    }

    public onFormSubmit(event: any, index: number|string) {
        jQuery.merge(this.currentEmployee.Employments[index], event.value);
    }
}
