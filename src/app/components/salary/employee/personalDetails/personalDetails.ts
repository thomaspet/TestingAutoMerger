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
    private LastSavedInfo: string;

    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;

    private employeeID: any;
    private formInstance: UniForm;
    private whenFormInstance: Promise<UniForm>;

    constructor(public rootRouteParams: RootRouteParamsService,
                public employeeService: EmployeeService,
                public router: Router) {
        // any way to get that in an easy way????
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
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
                    cmp.instance.config = this.form;
                    // cmp.instance.getEventEmitter().subscribe(this.executeSubmit(this));
                    this.whenFormInstance = new Promise((resolve: Function) => {
                        resolve(cmp.instance);
                    });
                    // this.formInstance = cmp.instance;
                    // this.formInstance.hideSubmitButton();
                });
            }
            , (error: any) => console.error(error)
        );
    }

    public isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }
    
    private saveEmployeeManual() {
        this.saveEmployee();
    }
    
    private saveEmployee() {
        console.log('save');
        
        this.formInstance.sync();
        this.LastSavedInfo = 'Lagrer persondetaljer på den ansatte';
        if (this.employee.ID > 0) {
            this.employeeService.Put(this.employee.ID, this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                this.LastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil ved oppdatering av ansatt', err);
            });
        } else {
            this.employeeService.Post(this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                this.LastSavedInfo = 'Sist lagret: ' + (new Date()).toLocaleTimeString();
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil oppsto ved lagring', err);
            });
        }
    }

    // private executeSubmit(context: PersonalDetails) {
    //     return () => {
    //         if (context.employee.ID) {
    //             context.employeeService.Put(context.employee.ID, context.employee)
    //                 .subscribe(
    //                     (data: Employee) => {
    //                         context.employee = data;
    //                         context.whenFormInstance.then((instance: UniForm) => {
    //                             instance.Model = context.employee;
    //                         });
    //                     },
    //                     (error: Error) => {
    //                         console.error('error in perosonaldetails.onSubmit - Put: ', error);
    //                     }
    //                 );
    //         } else {
    //             context.employeeService.Post(context.employee)
    //                 .subscribe(
    //                     (data: Employee) => {
    //                         context.employee = data;
    //                         this.router.navigateByUrl('/salary/employees/' + context.employee.ID);
    //                     },
    //                     (error: Error) => {
    //                         console.error('error in personaldetails.onSubmit - Post: ', error);
    //                     }
    //                 );
    //         }
    //     };
    // }
}
