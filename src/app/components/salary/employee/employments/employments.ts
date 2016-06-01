import {Component, Injector, Input, ViewChild} from '@angular/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {FieldType, STYRKCode, Employee, Employment, FieldLayout} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm} from '../../../../../framework/uniform';

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
            submitText: 'Lagre arbeidsforholdet'
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
            
            var autocompleteJobcode: FieldLayout = {
                ComponentLayoutID: 1,
                EntityType: 'Employment',
                Property: 'JobCode',
                Placement: 1,
                Hidden: false,
                LookupField: false,
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Combo: 0,
                FieldType: 0,
                Label: 'Stillingskode',
                ReadOnly: false,
                Placeholder: 'Stillingskode',
                Options: {
                    source: this.styrks,
                    template: (obj) => `${obj.styrk} - ${obj.tittel}`, 
                    displayProperty: 'styrk',
                    valueProperty: 'styrk',
                    debounceTime: 500,
                }
            };
            
            this.fields = [autocompleteJobcode, ...this.fields];
            
            this._employmentService.layoutSection('EmploymentDetailsSection')
            .subscribe((layoutSection: any) => {
                var typeEmployment: FieldLayout = {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'TypeOfEmployment',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Arbeidsforhold',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        source: this.typeOfEmployment, 
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Legend: 'A-meldingsinformasjon'
                };
                
                var renumType: FieldLayout = {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'RenumerationType',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Avlønningstype',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        source: this.renumerationType, 
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Legend: ''
                };
                
                var workHour: FieldLayout = {
                    ComponentLayoutID: 1,
                    EntityType: 'Employment',
                    Property: 'WorkingHoursScheme',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Arbeidstid',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: {
                        source: this.workingHoursScheme, 
                        valueProperty: 'ID',
                        displayProperty: 'Name'
                    },
                    LineBreak: null,
                    Combo: null,
                    Legend: ''

                };
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
        if (this.currentEmployment.ID > 0) {
            this._employmentService.Put(this.currentEmployment.ID, this.currentEmployment)
            .subscribe((response: Employment) => {
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
