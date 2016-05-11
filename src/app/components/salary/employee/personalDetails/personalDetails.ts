import {Component, ViewChild, ComponentRef, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFormBuilder, UniFormLayoutBuilder} from '../../../../../framework/forms';
import {UniComponentLoader} from '../../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee} from '../../../../unientities';
import {EmployeeService} from '../../../../services/services';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    providers: [EmployeeService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails implements OnInit {

    private form: UniFormBuilder = new UniFormBuilder();
    private employee: Employee;
    private lastSavedInfo: string;

    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;

    private employeeID: any;
    private formInstance: UniForm;
    private whenFormInstance: Promise<UniForm>;

    constructor(public rootRouteParams: RootRouteParamsService,
                public employeeService: EmployeeService,
                public router: Router) {
        this.employeeID = +rootRouteParams.params.get('id');
    }
    
    public ngOnInit() {
        if (this.employeeService.subEntities) {
            this.getData();
        }else {
            this.cacheLocAndGetData();
        }
    }
    
    private cacheLocAndGetData() {
        this.employeeService.getSubEntities().subscribe((response) => {
            this.employeeService.subEntities = response;
            
            this.getData();
        });
    }
    
    private getData() {
        Observable.forkJoin(
            this.employeeService.get(this.employeeID),
            this.employeeService.layout('EmployeePersonalDetailsForm')
        ).subscribe(
            (response: any) => {
                var [employee, layout] = response;
                layout.Fields[0].Validators = [{
                    'EntityType': 'BusinessRelation',
                    'PropertyName': 'BusinessRelationInfo.Name',
                    'Operator': Operator.Required,
                    'Operation': OperationType.CreateAndUpdate, // not used now. Operation is applied in all levels
                    'Level': ValidationLevel.Error, // not used now. All messages are errors
                    'Value': null,
                    'ErrorMessage': 'Employee name is required',
                    'ID': 1,
                    'Deleted': false
                }];
                this.employee = employee;
                this.form = new UniFormLayoutBuilder().build(layout, this.employee);
                this.form.hideSubmitButton();
                
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
                    cmp.instance.config = this.form;
                    this.whenFormInstance = new Promise((resolve: Function) => {
                        resolve(cmp.instance);
                    });
                    this.formInstance = cmp.instance;
                });
            }
            , (error: any) => console.error(error)
        );
    }

    public isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }
    
    public saveEmployeeManual() {
        this.employee.BusinessRelationInfo.Addresses[0].AddressLine1 = this.employee.BusinessRelationInfo.Addresses[0].AddressLine1 + '123';
        this.saveEmployee();
    }
    
    private saveEmployee() {
        console.log('save');
        
        this.formInstance.sync();
        this.lastSavedInfo = 'Lagrer persondetaljer på den ansatte';
        if (this.employee.ID > 0) {
            console.log('object to update', this.employee);
            this.employeeService.Put(this.employee.ID, this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil ved oppdatering av ansatt', err);
            });
        } else {
            this.employeeService.Post(this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                this.lastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
            });
        }
    }
}
