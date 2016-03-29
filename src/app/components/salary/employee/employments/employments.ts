import {RouteParams} from 'angular2/router';
import {Component, Injector} from 'angular2/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService} from '../../../../services/services';
import {STYRKCodesDS} from '../../../../data/styrkCodes';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {FieldType, STYRKCode, Employee} from '../../../../unientities';
import {
    UniForm, UniFormBuilder, UniFieldBuilder, UniSectionBuilder, UniFieldsetBuilder
} from '../../../../../framework/forms';
import {Observable} from 'rxjs/Observable';
import {Employment} from '../../../../unientities';
import {UniElementFinder} from '../../../../../framework/forms/shared/UniElementFinder';

declare var jQuery;

@Component({
    selector: 'employee-employment',
    directives: [UniForm],
    providers: [EmploymentService],
    templateUrl: 'app/components/salary/employee/employments/employments.html'
})
export class EmployeeEmployment {
    private currentEmployee: Employee;
    private formConfigs: UniFormBuilder[];
    private styrkCodes: STYRKCode;

    private typeOfEmployment: Array<any> = [
        {ID: 0, Navn: 'Ikke satt'},
        {ID: 1, Navn: '1 - Ordinært arbeidsforhold'},
        {ID: 2, Navn: '2 - Maritimt arbeidsforhold'},
        {ID: 3, Navn: '3 - Frilanser, oppdragstager, honorar'},
        {ID: 4, Navn: '4 - Pensjon og annet uten ansettelse'}
    ];

    private renumerationType: Array<any> = [
        {ID: 0, Navn: 'Udefinert'},
        {ID: 1, Navn: '1 - Fast lønnet'},
        {ID: 2, Navn: '2 - Timelønnet'},
        {ID: 3, Navn: '3 - Provisjonslønnet'},
        {ID: 4, Navn: '4 - Honorar'},
        {ID: 5, Navn: '5 - Akkord'}
    ];

    private workingHoursScheme: Array<any> = [
        {ID: 0, Navn: 'Udefinert'},
        {ID: 1, Navn: '1 - Ikke skiftarbeid'},
        {ID: 2, Navn: '2 - Arbeid offshore'},
        {ID: 3, Navn: '3 - Helkontinuerlig skiftarbeid'},
        {ID: 4, Navn: '4 - Døgnkontinuerlig skiftarbeid'},
        {ID: 5, Navn: '5 - 2 skiftarbeid'}
    ];

    private shipType: Array<any> = [
        {ID: 0, Navn: 'Udefinert'},
        {ID: 1, Navn: '1 - Annet'},
        {ID: 2, Navn: '2 - Boreplattform'},
        {ID: 3, Navn: '3 - Turist'}
    ];

    private shipReg: Array<any> = [
        {ID: 0, Navn: 'Udefinert'},
        {ID: 1, Navn: '1 - Norsk Internasjonalt skipsregister'},
        {ID: 2, Navn: '2 - Norsk ordinært skipsregister'},
        {ID: 3, Navn: '3 - Utenlandsk skipsregister'}
    ];

    private tradeArea: Array<any> = [
        {ID: 0, Navn: 'Udefinert'},
        {ID: 1, Navn: '1 - Innenriks'},
        {ID: 2, Navn: '2 - Utenriks'}
    ];

    private subEntities: Array<any> = [
        {ID: 0, Navn: 'Modalen'},
        {ID: 1, Navn: 'Haugesund'},
        {ID: 2, Navn: 'Bergen'},
        {ID: 3, Navn: 'Oslo'},
        {ID: 4, Navn: 'Trondheim'},
        {ID: 5, Navn: 'Stavanger'},
        {ID: 6, Navn: 'Bodø'}
    ];

    constructor(private _injector: Injector,
                private _employeeDS: EmployeeDS,
                private _styrkcodesDS: STYRKCodesDS,
                private _employmentService: EmploymentService) {
        let params = _injector.parent.parent.get(RouteParams);
        Observable.forkJoin(
            _employeeDS.get(params.get('id')),
            _styrkcodesDS.getCodes(),
            _employeeDS.getSubEntities()
        ).subscribe((response: any) => {
            let [employee, codes, subEnt] = response;
            //console.log('SubEntities from constructor', subEnt);
            this.currentEmployee = employee;
            this.styrkCodes = codes;
            this.subEntities = subEnt;
            this.buildFormConfigs();
        }, (error: any) => console.log(error));
    }

    private buildFormConfigs() {
        this.formConfigs = [];
        console.log('employments: ' + JSON.stringify(this.currentEmployee.Employments));
        this.currentEmployee.Employments.forEach((employment: Employment) => {
            var formbuilder = new UniFormBuilder();
            var AddSubEntity = false;
            if (!employment.JobCode) {employment.JobCode = ''; }
            var jobCode = this
                .buildField('Stillingskode', employment, 'JobCode', FieldType.AUTOCOMPLETE)
                .setKendoOptions({
                    dataSource: this.styrkCodes,
                    dataTextField: 'styrk',
                    dataValueField: 'styrk'
                });
            jobCode.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.updateJobCodeFields(dataItem, formbuilder);
            };

            var jobName = this.buildField('Navn', employment, 'JobName', FieldType.AUTOCOMPLETE)
                .setKendoOptions({
                    dataSource: this.styrkCodes,
                    dataTextField: 'tittel',
                    dataValueField: 'tittel'
                });
            jobName.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.updateJobCodeFields(dataItem, formbuilder);
            };

            var startDate = this.buildField('Startdato', employment, 'StartDate', FieldType.DATEPICKER);
            var endDate = this.buildField('Sluttdato', employment, 'EndDate', FieldType.DATEPICKER);
            var monthRate = this.buildField('Månedlønn', employment, 'MonthRate', FieldType.NUMERIC);
            var hourRate = this.buildField('Timelønn', employment, 'HourRate', FieldType.NUMERIC);
            var workPercent = this.buildField('Stillingprosent', employment, 'WorkPercent', FieldType.NUMERIC);

            if (employment.SubEntity) {
                if (employment.SubEntity.BusinessRelationInfo) {
                    var subEntity = this
                        .buildField('Lokasjon', employment.SubEntity.BusinessRelationInfo, 'Name', FieldType.COMBOBOX);
                    subEntity.setKendoOptions({
                        dataSource: this.subEntities,
                        dataTextField: 'BusinessRelationInfo.Name',
                        dataValueField: 'ID'
                    });
                    AddSubEntity = true;
                }
            }

            var readgroup = this.buildGroupForm(employment);

            if (AddSubEntity) {
                formbuilder.addUniElements(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, subEntity, readgroup);
            } else {
                formbuilder.addUniElements(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, readgroup);
            }


            //formbuilder.hideSubmitButton();
            this.formConfigs.push(formbuilder);
        });

    }
    
    private updateJobCodeFields(dataItem, formbuilder: UniFormBuilder){
        var fjn = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('JobName', formbuilder.config());
        fjn.control.updateValue(dataItem.tittel, {});
        var fjc = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('JobCode', formbuilder.config());
        fjc.control.updateValue(dataItem.styrk, {});
    }

    private buildGroupForm(employment: Employment) {
        var groupBuilder = new UniSectionBuilder('Vis mer');
        if (employment.Standard === true) {
            groupBuilder.openByDefault(true);
        }

        // a-meldingsinfo
        var ameldingSet = new UniFieldsetBuilder();
        var tOfEmplnt = this.buildField('Arbeidsforhold', employment, 'TypeOfEmployment', FieldType.COMBOBOX);
        tOfEmplnt.setKendoOptions({
            dataSource: this.typeOfEmployment,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var renum = this.buildField('Avlønning', employment, 'RenumerationType', FieldType.COMBOBOX);
        renum.setKendoOptions({
            dataSource: this.renumerationType,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var work = this.buildField('Arbeidstid', employment, 'WorkingHoursScheme', FieldType.COMBOBOX);
        work.setKendoOptions({
            dataSource: this.workingHoursScheme,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var hours = this.buildField('Standardtimer', employment, 'HoursPerWeek', FieldType.NUMERIC);
        ameldingSet.addUniElements(hours, tOfEmplnt, renum, work);

        // dates
        var dateSet = new UniFieldsetBuilder();
        var salary = this.buildField('Lønnsjustering', employment, 'LastSalaryChangeDate', FieldType.DATEPICKER);
        var percent = this.buildField('Endret stillingprosent', employment, 'LastWorkPercentChangeDate', FieldType.DATEPICKER);
        var senority = this.buildField('Ansiennitet', employment, 'SenorityDate', FieldType.DATEPICKER);
        dateSet.addUniElements(salary, percent, senority);

        // annen lønnsinfo
        var infoSet = new UniFieldsetBuilder();
        var freerate = this.buildField('Fri sats', employment, 'UserdefinedRate', FieldType.NUMERIC);
        var ledger = this.buildField('Hovedbokskonto', employment, 'LedgerAccount', FieldType.TEXT);
        infoSet.addUniElements(freerate, ledger);

        // dimensjoner
        // prosjekt - ?
        // avdeling - ?

        groupBuilder.addUniElements(ameldingSet, dateSet, infoSet);

        return groupBuilder;
    }

    private buildField(label: string, model: any, modelfield: string, type: number, index = null) {
        return new UniFieldBuilder()
            .setLabel(label)
            .setModel(model)
            .setModelField(modelfield)
            .setType(UNI_CONTROL_DIRECTIVES[type]);
    }

    private changeDefault(event, index) {
        console.log('Index when changing default: ' + index);
    }

    private onFormSubmit(index) {
        console.log('onFormSubmit(event, index)');
        
        if (this.currentEmployee.Employments[index].ID) {
            console.log('PUT');
            this._employmentService.Put(this.currentEmployee.Employments[index].ID, this.currentEmployee.Employments[index])
                .subscribe(
                    (data: Employment) => {
                        this.currentEmployee.Employments[index] = data;
                        this.buildFormConfigs();
                    },
                    (error: Error) => console.error('error in personaldetails.onFormSubmit - Put: ', error)
                );
        } else {
            console.log("we are now Posting this: " + JSON.stringify(this.currentEmployee.Employments[index]));
            this._employmentService.Post(this.currentEmployee.Employments[index])
                .subscribe(
                    (data: Employment) => {
                        this.currentEmployee.Employments[index] = data;
                        this.buildFormConfigs();
                    },
                    (error: Error) => console.error('error in personaldetails.onFormSubmit - Post: ', error)
                );
        }
    }
    
    private addNewEmployment() {
        console.log('addNewEmployment()');
        this._employmentService.GetNewEntity().subscribe((response: Employment) => {
            
            var newEmployment = response;
            newEmployment.EmployeeNumber = this.currentEmployee.EmployeeNumber;
            newEmployment.EmployeeID = this.currentEmployee.ID;
            newEmployment.JobCode = '';
            newEmployment.JobName = '';
            newEmployment.StartDate = new Date();
            newEmployment.EndDate = new Date();
            newEmployment.LastSalaryChangeDate = new Date();
            newEmployment.LastWorkPercentChangeDate = new Date();
            newEmployment.SeniorityDate = new Date();
            
            console.log(JSON.stringify(response));
            this.currentEmployee.Employments.push(response);
            this.buildFormConfigs();
        });
    }

    // @fixme: Proper date formatting here…
    private formatDate(date) {
        if (!date) {return ''; }

        date = new Date(date);
        return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    }

}
