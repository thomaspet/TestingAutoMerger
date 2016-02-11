import {RouteParams} from 'angular2/router';
import {Component, Injector, OnInit} from 'angular2/core';
import {EmployeeDS} from '../../../../framework/data/employee';
import {STYRKCodesDS} from '../../../../framework/data/styrkCodes';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../framework/controls/types';
import {
    UniCardFormBuilder,CardForm,UniForm,UniFormBuilder,UniFieldBuilder,UniGroupBuilder,UniFieldsetBuilder
} from '../../../../framework/forms';

declare var jQuery;

@Component({
    selector: 'employee-employment',
    directives: [UniForm, CardForm],
    templateUrl: 'app/components/employee/employments/employments.html'
})
export class Employment {
    currentEmployee;
    formConfigs: UniFormBuilder[];
    //cardformConfigs: UniCardFormBuilder[];
    styrkCodes;
    
    typeOfEmployment: Array<any> = [
        {ID: 0, Navn: "Ikke satt"},
        {ID: 1, Navn: "1 - Ordinært arbeidsforhold"},
        {ID: 2, Navn: "2 - Maritimt arbeidsforhold"},
        {ID: 3, Navn: "3 - Frilanser, oppdragstager, honorar"},
        {ID: 4, Navn: "4 - Pensjon og annet uten ansettelse"}
    ];
    
    renumerationType: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Fast lønnet"},
        {ID: 2, Navn: "2 - Timelønnet"},
        {ID: 3, Navn: "3 - Provisjonslønnet"},
        {ID: 4, Navn: "4 - Honorar"},
        {ID: 5, Navn: "5 - Akkord"}
    ];

    workingHoursScheme: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Ikke skiftarbeid"},
        {ID: 2, Navn: "2 - Arbeid offshore"},
        {ID: 3, Navn: "3 - Helkontinuerlig skiftarbeid"},
        {ID: 4, Navn: "4 - Døgnkontinuerlig skiftarbeid"},
        {ID: 5, Navn: "5 - 2 skiftarbeid"}
    ];

    shipType: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Annet"},
        {ID: 2, Navn: "2 - Boreplattform"},
        {ID: 3, Navn: "3 - Turist"}
    ];

    shipReg: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Norsk Internasjonalt skipsregister"},
        {ID: 2, Navn: "2 - Norsk ordinært skipsregister"},
        {ID: 3, Navn: "3 - Utenlandsk skipsregister"}
    ];

    tradeArea: Array<any> = [
        {ID: 0, Navn: "Udefinert"},
        {ID: 1, Navn: "1 - Innenriks"},
        {ID: 2, Navn: "2 - Utenriks"}
    ];
    
    
    constructor(private Injector:Injector, public employeeDS:EmployeeDS, public styrkcodesDS:STYRKCodesDS) {
        let params = Injector.parent.parent.get(RouteParams);
        employeeDS.get(params.get('id'))
        .subscribe(response => {
            this.currentEmployee = response;
            console.log(response);
            this.buildFormConfigs();
            console.log(this.formConfigs);
            //console.log(this.cardformConfigs);
        },error => console.log(error));
        
        styrkcodesDS.getCodes()
        .subscribe(response => {
            this.styrkCodes = response;
            console.log("STYRKCodes: " , response);
        },error => console.log(error));
    }
    
    buildFormConfigs() {
        this.formConfigs = [];
        //this.cardformConfigs = [];
        
        this.currentEmployee.Employments.forEach((employment) => {
            
            var cardformbuilder = new UniCardFormBuilder();
            var formbuilder = new UniFormBuilder();
            
            
            var jobcodedatasource = new kendo.data.DataSource({data: this.styrkCodes});
            var jobCode = this.buildField('Stillingskode',employment,'JobCode',UNI_CONTROL_TYPES.AUTOCOMPLETE);
            jobCode.onSelect((event) => {
                
                var item:any = event.item;
                console.log("item",item);
                var dataItem = event.sender.dataItem(item.index());
                
                console.log("dataItem", dataItem);
                
                var f = formbuilder.findFieldByPropertyName("JobCode");
                f.control.updateValue(dataItem.toJSON(),{});
                
                var name = formbuilder.findFieldByPropertyName("JobName");
                f.control.updateValue(dataItem.toJSON(), {});
                
            });
            
            jobCode.setKendoOptions({
                dataSource:  jobcodedatasource,
                dataTextField: 'styrk',
                dataValueField: 'tittel'
            });
            
            var jobName = this.buildField('Navn',employment,'JobName',UNI_CONTROL_TYPES.AUTOCOMPLETE);
            jobName.setKendoOptions({
               dataSource:  jobcodedatasource,
               dataTextField: 'tittel',
               dataValueField: 'styrk'
            });
            var startDate = this.buildField('Startdato',employment,'StartDate',UNI_CONTROL_TYPES.DATEPICKER);
            var endDate = this.buildField('Sluttdato',employment,'EndDate',UNI_CONTROL_TYPES.DATEPICKER);
            var monthRate = this.buildField('Månedlønn',employment,'MonthRate',UNI_CONTROL_TYPES.NUMERIC);
            var hourRate = this.buildField('Timelønn',employment,'HourRate',UNI_CONTROL_TYPES.NUMERIC);
            var workPercent = this.buildField('Stillingprosent',employment,'WorkPercent',UNI_CONTROL_TYPES.NUMERIC);
            
            if(typeof employment.Localization !== "undefined") 
            {
                if(typeof employment.Localization.BusinessRelationInfo !== "undefined")
                {
                    var localization = this.buildField('Lokalitet',employment.Localization.BusinessRelationInfo,'Name',UNI_CONTROL_TYPES.TEXT);
                }
            }
            else 
            {
                var localization = this.buildField('Lokalitet',employment,'LocalizationID',UNI_CONTROL_TYPES.NUMERIC);
            }
            
            var readgroup = this.buildGroupForm(employment);
            
            
            formbuilder.addFields(jobCode, jobName, startDate, endDate, monthRate, hourRate, workPercent, localization, readgroup);
            
            formbuilder.hideSubmitButton();
            this.formConfigs.push(formbuilder);
            
            cardformbuilder.addForm(formbuilder);
            //cardformbuilder.addForm(otherform);
            //this.cardformConfigs.push(cardformbuilder);
            
        });
        
    }
    
    buildGroupForm(employment) {
        var groupBuilder = new UniGroupBuilder("Vis mer");
        if(employment.Standard == true) {
            groupBuilder.openByDefault(true);
        }
        
        //A-meldingsinfo
        var ameldingSet = new UniFieldsetBuilder();
        var tOfEmplnt = this.buildField('Arbeidsforhold',employment,'TypeOfEmployment',UNI_CONTROL_TYPES.COMBOBOX);
        tOfEmplnt.setKendoOptions({
            dataSource:  this.typeOfEmployment,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var renum = this.buildField('Avlønning',employment,'RenumerationType',UNI_CONTROL_TYPES.COMBOBOX);
        renum.setKendoOptions({
            dataSource:  this.renumerationType,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var work = this.buildField('Arbeidstid',employment,'WorkingHoursScheme',UNI_CONTROL_TYPES.COMBOBOX);
        work.setKendoOptions({
            dataSource:  this.workingHoursScheme,
            dataTextField: 'Navn',
            dataValueField: 'ID'
        });
        var hours = this.buildField('Standardtimer',employment,'HoursPerWeek',UNI_CONTROL_TYPES.COMBOBOX);
        ameldingSet.addFields(hours,tOfEmplnt,renum,work);
        
        //Dates
        var dateSet = new UniFieldsetBuilder();
        var salary = this.buildField('Lønnsjustering',employment,'LastSalaryChangeDate',UNI_CONTROL_TYPES.DATEPICKER);
        var percent = this.buildField('Endret stillingprosent',employment,'LastWorkPercentChangeDate',UNI_CONTROL_TYPES.DATEPICKER);
        var senority = this.buildField('Ansiennitet',employment,'SenorityDate',UNI_CONTROL_TYPES.DATEPICKER);
        dateSet.addFields(salary,percent,senority);
        
        //Annen lønnsinfo
        var infoSet = new UniFieldsetBuilder();
        var freerate = this.buildField('Fri sats',employment,'UserdefinedRate',UNI_CONTROL_TYPES.NUMERIC);
        var ledger = this.buildField('Hovedbokskonto',employment,'LedgerAccount',UNI_CONTROL_TYPES.TEXT);
        infoSet.addFields(freerate,ledger);
        
        //Dimensjoner
        //Prosjekt - ?
        //Avdeling - ?
        
        groupBuilder.addFields(ameldingSet,dateSet,infoSet);
        
        return groupBuilder;
    }
    
    buildField(label,model,modelfield,type, index = null) {
        return new UniFieldBuilder()
        .setLabel(label)
        .setModel(model)
        .setModelField(modelfield)
        .setType(UNI_CONTROL_DIRECTIVES[type]);
    }
    
    changeDefault(event, index) {
        console.log("Index when changing default: " + index);
    }
    
    onFormSubmit(event, index) {
        jQuery.merge(this.currentEmployee.Employments[index], event.value);
    }
}
