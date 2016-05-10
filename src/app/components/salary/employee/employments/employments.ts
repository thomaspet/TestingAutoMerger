import {Component, Injector, Input, ViewChild, OnInit, ComponentRef} from '@angular/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {FieldType, STYRKCode, Employee, Employment} from '../../../../unientities';
import {UniForm, UniFormBuilder, UniFieldBuilder, UniSectionBuilder} from '../../../../../framework/forms';
import {UniElementFinder} from '../../../../../framework/forms/shared/UniElementFinder';
import {UniComponentLoader} from '../../../../../framework/core';

declare var jQuery;

@Component({
    selector: 'employment-details',
    directives: [UniForm, UniComponentLoader],
    providers: [EmploymentService],
    templateUrl: 'app/components/salary/employee/employments/employments.html'
})

export class EmployeeEmployment implements OnInit {
    // private formConfigs: UniFormBuilder[];
    private styrks: STYRKCode[];
    
    @Input() private currentEmployment: Employment;
    @Input() private currentEmployee: Employee;
    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    
    private form: UniFormBuilder = new UniFormBuilder();
    public formModel: any = {};
    private whenFormInstance: Promise<UniForm>;
    
    private busy: boolean;

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

    constructor(private injector: Injector, 
                public employeeDS: EmployeeDS,
                public statReg: StaticRegisterService,
                private _employmentService: EmploymentService) {
        
        this.styrks = this.statReg.getStaticRegisterDataset('styrk');
    }
    
    public ngOnInit() {
        this.employeeDS.getSubEntities()
        .subscribe((response: any) => {
            this.subEntities = response;
            this.updateAndShowView();
        },
        (err: any) => {
            console.log('error getting subentities: ', err);
        });
    }
    
    public ngOnChanges(valueChanges) {
        this.busy = false;
        if (valueChanges.currentEmployment.previousValue.ID !== undefined) {
            if (this.currentEmployment) {
                setTimeout(() => {
                    this.updateAndShowView(true);
                }, 100);
            }
        }
    }
    
    private updateAndShowView(update: boolean = false) {
        if (update) {
            this.formModel.employment = this.currentEmployment;
            this.whenFormInstance.then((instance: UniForm) => instance.Model = this.formModel);
        } else {
            this.buildDetailConfig();
            this.loadForm();
        }
        this.busy = false;
    }
    
    private buildDetailConfig() {
        this.formModel.employment = this.currentEmployment;
        var formbuilder = new UniFormBuilder();
        
        var jobCode = this.buildField('Stillingkode', this.formModel, 
            'employment.JobCode', FieldType.AUTOCOMPLETE);
        jobCode.setKendoOptions({
            source: this.styrks,
            valueKey: 'styrk',
            template: (obj: any) => `${obj.styrk} - ${obj.tittel}`,
            minLength: 2,
            debounceTime: 300
        });
        jobCode.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
            var item: any = event.item;
            var dataItem = event.sender.dataItem(item.index());
            this.updateJobCodeFields(dataItem, formbuilder);
        };
        
        var jobName = this.buildField('Stillingnavn', this.formModel, 
            'employment.JobName', FieldType.AUTOCOMPLETE);    
        jobName.setKendoOptions({
            source: this.styrks,
            valueKey: 'tittel',
            template: (obj: any) => `${obj.styrk} - ${obj.tittel}`,
            minLength: 2,
            debounceTime: 300
        });
        jobName.onSelect = (event: kendo.ui.AutoCompleteSelectEvent) => {
            var item: any = event.item;
            var dataItem = event.sender.dataItem(item.index());
            this.updateJobCodeFields(dataItem, formbuilder);
        };
        
        var standard = this.buildField('Standard', this.formModel, 'employment.Standard', FieldType.CHECKBOX);
        var startDate = this.buildField('Startdato', this.formModel, 'employment.StartDate', FieldType.DATEPICKER);
        var endDate = this.buildField('Sluttdato', this.formModel, 'employment.EndDate', FieldType.DATEPICKER);
        var workPercent = this.buildField('Stillingprosent', this.formModel, 'employment.WorkPercent', FieldType.NUMERIC);
        var subEntity = this.buildField('Virksomhet', this.currentEmployment.SubEntity.BusinessRelationInfo,
            'employment.SubEntity.BusinessRelationInfo.Name', FieldType.COMBOBOX);
        subEntity.setKendoOptions({
            dataSource: this.subEntities,
            dataTextField: 'BusinessRelationInfo.Name',
            dataValueField: 'ID'
        });    
        var monthRate = this.buildField('Månedslønn', this.formModel, 'employment.MonthRate', FieldType.NUMERIC);
        var hourRate = this.buildField('Timelønn', this.formModel, 'employment.HourRate', FieldType.NUMERIC);
        
        var readgroup = this.buildGroupForm();

        formbuilder.addUniElements(jobCode, jobName, workPercent, standard, startDate, endDate, subEntity, monthRate, hourRate, readgroup);
        formbuilder.hideSubmitButton();
        
        this.form = formbuilder;
    }
    
    private loadForm() {
        this.uniCompLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
            cmp.instance.config = this.form;
            this.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
        });
    }
    
    private updateJobCodeFields(dataItem, formbuilder: UniFormBuilder) {
        var fjn = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('employment.JobName', formbuilder.config());
        fjn.control.updateValue(dataItem.tittel, {});
        var fjc = <UniFieldBuilder>UniElementFinder.findUniFieldByPropertyName('employment.JobCode', formbuilder.config());
        fjc.control.updateValue(dataItem.styrk, {});
    }

    private buildGroupForm() {
        var groupBuilder = new UniSectionBuilder('A-meldingsinformasjon');
        if (this.currentEmployment.Standard === true) {
            groupBuilder.openByDefault(true);
        }

        // a-meldingsinfo
        var tOfEmplnt = this.buildField('Arbeidsforhold', this.formModel, 'employment.TypeOfEmployment', FieldType.COMBOBOX);
        tOfEmplnt.setKendoOptions({
            dataSource: this.typeOfEmployment,
            dataTextField: 'Name',
            dataValueField: 'ID'
        });
        var renum = this.buildField('Avlønning', this.formModel, 'employment.RenumerationType', FieldType.COMBOBOX);
        renum.setKendoOptions({
            dataSource: this.renumerationType,
            dataTextField: 'Name',
            dataValueField: 'ID'
        });
        var work = this.buildField('Arbeidstid', this.formModel, 'employment.WorkingHoursScheme', FieldType.COMBOBOX);
        work.setKendoOptions({
            dataSource: this.workingHoursScheme,
            dataTextField: 'Name',
            dataValueField: 'ID'
        });
        var hours = this.buildField('Timer pr uke', this.formModel, 'employment.HoursPerWeek', FieldType.NUMERIC);

        // dates
        var senority = this.buildField('Ansiennitet', this.formModel, 'employment.SeniorityDate', FieldType.DATEPICKER);
        var salary = this.buildField('Lønnsjustering', this.formModel, 'employment.LastSalaryChangeDate', FieldType.DATEPICKER);
        var percent = this.buildField('Sist endret %', this.formModel, 'employment.LastWorkPercentChangeDate', FieldType.DATEPICKER);
        
        // annen lønnsinfo
        var freerate = this.buildField('Fri sats', this.formModel, 'employment.UserDefinedRate', FieldType.NUMERIC);
        var ledger = this.buildField('Hovedbokskonto', this.formModel, 'employment.LedgerAccount', FieldType.TEXT);
        
        // dimensjoner
        // prosjekt - ?
        // avdeling - ?

        groupBuilder.addUniElements(tOfEmplnt, renum, work, hours, senority, salary, percent, freerate, ledger);

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

    // public onFormSubmit(index) {
    //     console.log('onFormSubmit(event, index)');
        
    //     if (this.currentEmployee.Employments[index].ID) {
    //         console.log('PUT');
    //         this._employmentService.Put(this.currentEmployee.Employments[index].ID,
    //             this.currentEmployee.Employments[index])
    //             .subscribe(
    //                 (data: Employment) => {
    //                     this.currentEmployee.Employments[index] = data;
    //                     this.buildFormConfigs();
    //                 },
    //                 (error: Error) => {
    //                     console.error('error in personaldetails.onFormSubmit - Put: ', error);
    //                 }
    //             );
    //     } else {
    //         console.log('POST');
    //         this._employmentService.Post(this.currentEmployee.Employments[index])
    //             .subscribe(
    //                 (data: Employment) => {
    //                     this.currentEmployee.Employments[index] = data;
    //                     this.buildFormConfigs();
    //                 },
    //                 (error: Error) => {
    //                     console.error('error in personaldetails.onFormSubmit - Post: ', error);
    //                 }
    //             );
    //     }
    // }
    
    public addNewEmployment() {
        this._employmentService.GetNewEntity().subscribe((response: Employment) => {
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
            // this.buildFormConfigs();
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
