import {Component, Injector, Input, ViewChild} from '@angular/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {FieldType, STYRKCode, Employee, Employment, FieldLayout} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';

declare var jQuery;

@Component({
    selector: 'employment-details',
    directives: [UniForm, UniSave],
    providers: [EmploymentService],
    templateUrl: 'app/components/salary/employee/employments/employments.html'
})

export class EmployeeEmployment {
    private styrks: STYRKCode[];
    
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    @Input() private currentEmployment: Employment;
    @Input() private currentEmployee: Employee;
      
    private busy: boolean;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre arbeidsforhold',
            action: this.saveEmployment.bind(this),
            main: true,
            disabled: true
        }
    ];

    private typeOfEmployment: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
        {ID: 1, Name: '1 - Ordinært arbeidsforhold'},
        {ID: 2, Name: '2 - Maritimt arbeidsforhold'},
        {ID: 3, Name: '3 - Frilanser, oppdragstager, honorar'},
        {ID: 4, Name: '4 - Pensjon og annet uten ansettelse'}
    ];

    private renumerationType: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
        {ID: 1, Name: '1 - Fast lønnet'},
        {ID: 2, Name: '2 - Timelønnet'},
        {ID: 3, Name: '3 - Provisjonslønnet'},
        {ID: 4, Name: '4 - Honorar'},
        {ID: 5, Name: '5 - Akkord'}
    ];

    private workingHoursScheme: {ID: number, Name: string}[] = [
        {ID: 0, Name: 'Ikke valgt'},
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
        
        this.config = {
            submitText: ''
        };
        
        if (this._employmentService.subEntities) {
            this.refreshDatafromModel();
        } else {
            this.cacheSubentitiesAndRefreshData();
        }
    }
    
    private cacheSubentitiesAndRefreshData() {
        this.employeeDS.getSubEntities().subscribe((response: any) => {
            this._employmentService.subEntities = response;
            console.log('subentitites', response);
            this.refreshDatafromModel();
        },
        (err: any) => {
            console.log('error getting subentities: ', err);
        });
    }
    
    private refreshDatafromModel() {
        console.log('employment', this.currentEmployment);
        this._employmentService.layout('EmploymentDetails')
        .subscribe((layout: any) => {
            this.fields = layout.Fields;
            
            var autocompleteJobcode = new UniFieldLayout();
            autocompleteJobcode.EntityType = 'Employment';
            autocompleteJobcode.Property = 'JobCode';
            autocompleteJobcode.Placement = 1;
            autocompleteJobcode.Hidden = false;
            autocompleteJobcode.LookupField = false;
            autocompleteJobcode.Description = null;
            autocompleteJobcode.HelpText = null;
            autocompleteJobcode.FieldSet = 0;
            autocompleteJobcode.Section = 0;
            autocompleteJobcode.Combo = 0;
            autocompleteJobcode.FieldType = 0;
            autocompleteJobcode.Label = 'Stillingskode';
            autocompleteJobcode.ReadOnly = false;
            autocompleteJobcode.Placeholder = 'Stillingskode';
            autocompleteJobcode.Options = {
                source: this.styrks,
                template: (obj) => `${obj.styrk} - ${obj.tittel}`, 
                displayProperty: 'styrk',
                valueProperty: 'styrk',
                debounceTime: 500,
            };
            
            this.fields = [autocompleteJobcode, ...this.fields];
            
            this._employmentService.layoutSection('EmploymentDetailsSection')
            .subscribe((layoutSection: any) => {
                
                var typeEmployment = new UniFieldLayout();
                typeEmployment.ComponentLayoutID = 1;
                typeEmployment.EntityType = 'Employment';
                typeEmployment.Property = 'TypeOfEmployment';
                typeEmployment.Placement = 3;
                typeEmployment.Hidden = false;
                typeEmployment.FieldType = FieldType.DROPDOWN;
                typeEmployment.ReadOnly = false;
                typeEmployment.LookupField = false;
                typeEmployment.Label = 'Arbeidsforhold';
                typeEmployment.Description = null;
                typeEmployment.HelpText = null;
                typeEmployment.FieldSet = 0;
                typeEmployment.Section = 1;
                typeEmployment.Placeholder = null;
                typeEmployment.Options = {
                    source: this.typeOfEmployment, 
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                };
                typeEmployment.LineBreak = null;
                typeEmployment.Combo = null;
                typeEmployment.Legend = 'A-meldingsinformasjon';
                
                var renumType = new UniFieldLayout();
                renumType.EntityType = 'Employment';
                renumType.Property = 'RenumerationType';
                renumType.Placement = 4;
                renumType.Hidden = false;
                renumType.FieldType = FieldType.DROPDOWN;
                renumType.ReadOnly = false;
                renumType.LookupField = false;
                renumType.Label = 'Avlønningstype';
                renumType.Description = null;
                renumType.HelpText = null;
                renumType.FieldSet = 0;
                renumType.Section = 1;
                renumType.Placeholder = null;
                renumType.Options = {
                    source: this.renumerationType, 
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                };
                renumType.LineBreak = null;
                renumType.Combo = null;
                renumType.Legend = '';
                
                var workHour = new UniFieldLayout();
                workHour.EntityType = 'Employment';
                workHour.Property = 'WorkingHoursScheme';
                workHour.Placement = 5;
                workHour.Hidden = false;
                workHour.FieldType = FieldType.DROPDOWN;
                workHour.ReadOnly = false;
                workHour.LookupField = false;
                workHour.Label = 'Arbeidstid';
                workHour.Description = null;
                workHour.HelpText = null;
                workHour.FieldSet = 0;
                workHour.Section = 1;
                workHour.Placeholder = null;
                workHour.Options = {
                    source: this.workingHoursScheme, 
                    valueProperty: 'ID',
                    displayProperty: 'Name'
                };
                workHour.LineBreak = null;
                workHour.Combo = null;
                workHour.Legend = '';
                    
                this.fields = [...this.fields, typeEmployment, renumType, workHour, ...layoutSection.Fields];
                this.busy = false;
            });
        });
    }
    
    public ngOnChanges(valueChanges) {
        this.busy = false;
        if (valueChanges.currentEmployment.previousValue.ID !== undefined) {
            if (this.currentEmployment) {
                this.refreshDatafromModel();
            }
        }
    }
    
    public ready(value) {
        console.log('form ready', value);
    }
    
    public change(value) {
        console.log('uniform changed', value);
        this.saveactions[0].disabled = false;
    }
    
    public saveEmployment(done) {
        done('Lagrer arbeidsforhold');
        console.log('arbeidsforhold å lagre', this.currentEmployment);
        if (this.currentEmployment.ID > 0) {
            this._employmentService.Put(this.currentEmployment.ID, this.currentEmployment)
            .subscribe((response: Employment) => {
                console.log('arbeidsforhold som vart lagret', response);
                this.currentEmployment = response;
                done('Sist lagret: ');
            },
            (err) => {
                console.log('Feil ved oppdatering av arbeidsforhold', err);
            });
        } else {
            this._employmentService.Post(this.currentEmployment)
            .subscribe((response: Employment) => {
                this.currentEmployment = response;
                done('Sist lagret: ');
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
            });
        }
    }
    
    public changeDefault(event, index) {
        console.log('Index when changing default: ' + index);
    }
    
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
        });
    }
}
