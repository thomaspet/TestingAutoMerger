import {RouteParams} from 'angular2/router';
import {Component, Injector} from 'angular2/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {STYRKCodesDS} from '../../../../data/styrkCodes';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {FieldType, STYRKCode, Employee, SubEntity, Employment} from '../../../../unientities';
import {
    UniForm, UniFormBuilder, UniFieldBuilder, UniSectionBuilder, UniFieldsetBuilder
} from '../../../../../framework/forms';
import {Observable} from 'rxjs/Observable';
import {UniElementFinder} from '../../../../../framework/forms/shared/UniElementFinder';
import {ParamsService} from '../../../../services/ParamsService';

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
    // private styrkCodes: Array<any>;
    // private staticRegisterService: StaticRegisterService;
    private styrks: STYRKCode[];

    private typeOfEmployment: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke satt'},
        {ID: 1, Name: '1 - Ordinært arbeidsforhold'},
        {ID: 2, Name: '2 - Maritimt arbeidsforhold'},
        {ID: 3, Name: '3 - Frilanser, oppdragstager, honorar'},
        {ID: 4, Name: '4 - Pensjon og annet uten ansettelse'}
    ];

    private renumerationType: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Udefinert'},
        {ID: 1, Name: '1 - Fast lønnet'},
        {ID: 2, Name: '2 - Timelønnet'},
        {ID: 3, Name: '3 - Provisjonslønnet'},
        {ID: 4, Name: '4 - Honorar'},
        {ID: 5, Name: '5 - Akkord'}
    ];

    private workingHoursScheme: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Udefinert'},
        {ID: 1, Name: '1 - Ikke skiftarbeid'},
        {ID: 2, Name: '2 - Arbeid offshore'},
        {ID: 3, Name: '3 - Helkontinuerlig skiftarbeid'},
        {ID: 4, Name: '4 - Døgnkontinuerlig skiftarbeid'},
        {ID: 5, Name: '5 - 2 skiftarbeid'}
    ];

    // private shipType: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Annet'},
    //     {ID: 2, Name: '2 - Boreplattform'},
    //     {ID: 3, Name: '3 - Turist'}
    // ];

    // private shipReg: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Norsk Internasjonalt skipsregister'},
    //     {ID: 2, Name: '2 - Norsk ordinært skipsregister'},
    //     {ID: 3, Name: '3 - Utenlandsk skipsregister'}
    // ];

    // private tradeArea: {ID: number, Name: string}[] = [
    //     {ID: 0, Name: 'Udefinert'},
    //     {ID: 1, Name: '1 - Innenriks'},
    //     {ID: 2, Name: '2 - Utenriks'}
    // ];

    private subEntities: any;

    constructor(private params: ParamsService, 
                public employeeDS: EmployeeDS, 
                public styrkcodesDS: STYRKCodesDS, 
                public statReg: StaticRegisterService,
                private _employmentService: EmploymentService) {
        
        this.styrks = this.statReg.getStaticRegisterDataset('styrk');
        
        Observable.forkJoin(
            employeeDS.get(params.get('EmployeeID')),
            employeeDS.getSubEntities()
        ).subscribe((response: any) => {
            let [employee, subEnt] = response;
            this.currentEmployee = employee;
            this.subEntities = subEnt;
            this.buildFormConfigs();
        }, (error: any) => console.log(error));
    }

    private buildFormConfigs(): void {
        this.formConfigs = [];
        
        this.currentEmployee.Employments.forEach((employment: Employment) => {
            var formbuilder = new UniFormBuilder();

            var jobCode = this
                .buildField('Stillingskode', employment, 'JobCode', FieldType.AUTOCOMPLETE)
                .setKendoOptions({
                    dataSource: this.styrks,
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
                    dataSource: this.styrks,
                    dataTextField: 'tittel',
                    dataValueField: 'tittel'
                });
            jobName.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.updateJobCodeFields(dataItem, formbuilder);
            };

            var startDate = this.buildField('Startdato', employment, 'StartDate'
                , FieldType.DATEPICKER);
            var endDate = this.buildField('Sluttdato', employment, 'EndDate'
                , FieldType.DATEPICKER);
            var monthRate = this.buildField('Månedlønn', employment, 'MonthRate'
                , FieldType.NUMERIC);
            var hourRate = this.buildField('Timelønn', employment, 'HourRate', FieldType.NUMERIC);
            var workPercent = this.buildField('Stillingprosent', employment, 'WorkPercent'
                , FieldType.NUMERIC);

            
            var subEntity = this.buildField('Lokasjon', employment.SubEntity.BusinessRelationInfo,
                'Name', FieldType.COMBOBOX);
            subEntity.setKendoOptions({
                dataSource: this.subEntities,
                dataTextField: 'BusinessRelationInfo.Name',
                dataValueField: 'ID'
            });
            var readgroup = this.buildGroupForm(employment);

            formbuilder.addUniElements(jobCode, 
                                       jobName, 
                                       startDate, 
                                       endDate, 
                                       monthRate, 
                                       hourRate, 
                                       workPercent, 
                                       subEntity, 
                                       readgroup);

            this.formConfigs.push(formbuilder);
        });

    }
    
    private updateJobCodeFields(dataItem, formbuilder: UniFormBuilder) {
        var fjn = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('JobName',
            formbuilder.config());
        fjn.control.updateValue(dataItem.tittel, {});
        var fjc = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('JobCode', 
            formbuilder.config());
        fjc.control.updateValue(dataItem.styrk, {});
    }

    private buildGroupForm(employment: Employment) {
        var groupBuilder = new UniSectionBuilder('Vis mer');
        if (employment.Standard === true) {
            groupBuilder.openByDefault(true);
        }

        // a-meldingsinfo
        var ameldingSet = new UniFieldsetBuilder();
        var tOfEmplnt = this.buildField('Arbeidsforhold', employment, 'TypeOfEmployment'
            , FieldType.COMBOBOX);
        tOfEmplnt.setKendoOptions({
            dataSource: this.typeOfEmployment,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var renum = this.buildField('Avlønning', employment, 'RenumerationType'
            , FieldType.COMBOBOX);
        renum.setKendoOptions({
            dataSource: this.renumerationType,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var work = this.buildField('Arbeidstid', employment, 'WorkingHoursScheme'
            , FieldType.COMBOBOX);
        work.setKendoOptions({
            dataSource: this.workingHoursScheme,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var hours = this.buildField('Standardtimer', employment, 'HoursPerWeek', FieldType.NUMERIC);
        ameldingSet.addUniElements(hours, tOfEmplnt, renum, work);

        // dates
        var dateSet = new UniFieldsetBuilder();
        var salary = this.buildField('Lønnsjustering', employment, 'LastSalaryChangeDate'
            , FieldType.DATEPICKER);
        var percent = this.buildField('Endret stillingprosent', employment
            , 'LastWorkPercentChangeDate', FieldType.DATEPICKER);
        var senority = this.buildField('Ansiennitet', employment, 'SeniorityDate'
            , FieldType.DATEPICKER);
        dateSet.addUniElements(salary, percent, senority);

        // annen lønnsinfo
        var infoSet = new UniFieldsetBuilder();
        var freerate = this.buildField('Fri sats', employment, 'UserDefinedRate'
            , FieldType.NUMERIC);
        var ledger = this.buildField('Hovedbokskonto', employment, 'LedgerAccount'
            , FieldType.TEXT);
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

    public changeDefault(event, index) {
        console.log('Index when changing default: ' + index);
    }

    public onFormSubmit(index) {
        console.log('onFormSubmit(event, index)');
        
        if (this.currentEmployee.Employments[index].ID) {
            console.log('PUT');
            this._employmentService.Put(this.currentEmployee.Employments[index].ID,
                this.currentEmployee.Employments[index])
                .subscribe(
                    (data: Employment) => {
                        this.currentEmployee.Employments[index] = data;
                        this.buildFormConfigs();
                    },
                    (error: Error) => {
                        console.error('error in personaldetails.onFormSubmit - Put: ', error);
                    }
                );
        } else {
            console.log('POST');
            this._employmentService.Post(this.currentEmployee.Employments[index])
                .subscribe(
                    (data: Employment) => {
                        this.currentEmployee.Employments[index] = data;
                        this.buildFormConfigs();
                    },
                    (error: Error) => {
                        console.error('error in personaldetails.onFormSubmit - Post: ', error);
                    }
                );
        }
    }
    
    public addNewEmployment() {
        console.log('addNewEmployment()');
        this._employmentService.GetNewEntity().subscribe((response: Employment) => {
            console.log('response');
            var standardSubEntity = this.subEntities.find(newSubEntity => 
                    newSubEntity.SuperiorOrganizationID === null);
                    
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
            newEmployment.SubEntityID = standardSubEntity.ID;
            newEmployment.SubEntity = standardSubEntity;
            
            this.currentEmployee.Employments.push(response);
            this.buildFormConfigs();
        });
    }

    // @fixme: Proper date formatting here…
    private formatDate(date) {
        if (!date) {
            return '';
        }
        date = new Date(date);
        return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    }

}
