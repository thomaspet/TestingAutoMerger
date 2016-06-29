import {Component, Injector, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {EmployeeDS} from '../../../../data/employee';
import {EmploymentService, StaticRegisterService} from '../../../../services/services';
import {FieldType, STYRKCode, Employee, Employment, FieldLayout} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm} from '../../../../../framework/uniform';
import {UniFieldLayout} from '../../../../../framework/uniform/index';

declare var jQuery;
declare var _; // lodash

@Component({
    selector: 'employment-details',
    directives: [UniForm, UniSave],
    providers: [EmploymentService],
    templateUrl: 'app/components/salary/employee/employments/employments.html'
})

export class EmployeeEmployment {
    private styrks: STYRKCode[];
    
    public config: any = {};
    public fields: UniFieldLayout[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    @Input() private currentEmployment: Employment;
    @Input() private currentEmployee: Employee;

    @Output() private refreshList: EventEmitter<any> = new EventEmitter<any>(true);

    private busy: boolean;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre arbeidsforhold',
            action: this.saveEmployment.bind(this),
            main: true,
            disabled: true
        }
    ];

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
            this.refreshDatafromModel();
        },
        (err: any) => {
            console.log('error getting subentities: ', err);
            this.log(err);
        });
    }

    private updateTitle(styrk) {
        if (styrk) {
            let styrkObj = this.styrks.find(x => x.styrk === styrk);
            this.currentEmployment.JobName = styrkObj.tittel;
            this.currentEmployment = _.cloneDeep(this.currentEmployment);
            this.uniform.field('WorkPercent').focus();
        }
    }
    
    private refreshDatafromModel() {
        this._employmentService.layout('EmploymentDetails')
        .subscribe((layout: any) => {
            this.fields = layout.Fields;

            let autocompleteJobcode = this.findByProperty(this.fields, 'JobCode');
            autocompleteJobcode.Options = {
                source: this.styrks,
                template: (obj) => obj ? `${obj.styrk} - ${obj.tittel}` : '', 
                displayProperty: 'styrk',
                valueProperty: 'styrk',
                debounceTime: 500,
                events: {
                    select: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    },
                    enter: (model: Employment) => {
                        this.updateTitle(model.JobCode);
                    }
                }
            };

            this.fields = _.cloneDeep(this.fields);
            this.busy = false;
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
    }
    
    public change(value) {
        this.saveactions[0].disabled = false;
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field; 
    }
    
    public saveEmployment(done) {
        done('Lagrer arbeidsforhold');
        if (this.currentEmployment.ID > 0) {
            this._employmentService.Put(this.currentEmployment.ID, this.currentEmployment)
            .subscribe((response: Employment) => {
                this.refreshList.emit(true);
                this.currentEmployment = response;
                done('Sist lagret: ');
            },
            (err) => {
                console.log('Feil ved oppdatering av arbeidsforhold', err);
                this.log(err);
            });
        } else {
            this._employmentService.Post(this.currentEmployment)
            .subscribe((response: Employment) => {
                this.currentEmployment = response;
                this.refreshList.emit(true);
                done('Sist lagret: ');
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
                this.log(err);
            });
        }
    }
    
    public addNewEmployment() {
        this._employmentService.GetNewEntity().subscribe((response: Employment) => {
                    
            var newEmployment = response;
            newEmployment.EmployeeNumber = this.currentEmployee.EmployeeNumber;
            newEmployment.EmployeeID = this.currentEmployee.ID;
            newEmployment.JobCode = '';
            newEmployment.JobName = '';
            newEmployment.StartDate = new Date();
            newEmployment.LastSalaryChangeDate = new Date();
            newEmployment.LastWorkPercentChangeDate = new Date();
            newEmployment.SeniorityDate = new Date();
            
            this.currentEmployment = newEmployment;
        });
    }

    public log(err) {
        alert(err._body);
    }
}
