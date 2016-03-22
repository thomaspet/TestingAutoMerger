import {Component, Injector, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {
    UniFormBuilder, UniFormLayoutBuilder
} from '../../../../../framework/forms';
import {EmployeeDS} from '../../../../data/employee';
import {EmployeeModel} from '../../../../models/employee';
import {UniComponentLoader} from '../../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {UniValidator} from '../../../../../framework/validators/UniValidator';
import {OperationType, Operator, ValidationLevel, Employee, BankAccountSalary} from '../../../../unientities';
import {EmployeeService} from '../../../../services/services';

declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    providers: [EmployeeService],
    template: `
        <article class='application usertest'>
            <!--<button (click)='toggleMode()'>Toogle edit mode</button>-->
            <uni-component-loader></uni-component-loader>
            <!--<button type='button' (click)='executeSubmit()' [disabled]='!isValid()'>Submit</button>-->
        </article>
    `
})
export class PersonalDetails {

    private form: UniFormBuilder = new UniFormBuilder();
    private layout;
    private employee: Employee;
    private subEntities;

    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;

    private employeeID: any;
    private formInstance: UniForm;
    private whenFormInstance: Promise<UniForm>;

    constructor(public injector: Injector,
                public employeeDS: EmployeeDS,
                public employeeService: EmployeeService,
                public router: Router) {
        // any way to get that in an easy way????
        var routeParams = this.injector.parent.parent.get(RouteParams);
        this.employeeID = +routeParams.get('id');
    }
    
    private ngOnInit() {
        if (this.employeeService.subEntities) {
            this.getData();
        }else {
            this.cacheLocAndGetData();
        }
    }

    /*private ngAfterViewInit() {

        if (this.employeeService.subEntities){
            this.getData();
        }else {
            this.cacheLocAndGetData();
        }
    }*/
    
    private cacheLocAndGetData() {
        this.employeeService.getSubEntities().subscribe((response) => {
            this.employeeService.subEntities = response;
            
            this.getData();
        });
    }
    
    private getData(){
        var self = this;

        /*
         http.get(url).map(res => res.json())
         .flatMap(response => {
         return http.get(url2+'/'+response.param).map(res => res.json())
         .map(response2 => {
         //do whatever and return
         })
         }).subscribe()
         */
        Observable.forkJoin(
            self.employeeService.get(this.employeeID),
            self.employeeService.layout('EmployeePersonalDetailsForm')
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
                self.employee = employee;
                if (!self.employee.BankAccounts[0]) {
                    console.log('making ready account');
                    var account: BankAccountSalary = new BankAccountSalary();
                    account.AccountNumber = '12345678903';
                    self.employee.BankAccounts[0] = account;
                }
                self.form = new UniFormLayoutBuilder().build(layout, self.employee);
                
                self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = self.form;
                    cmp.instance.getEventEmitter().subscribe(this.executeSubmit(this));
                    this.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
                    /*setTimeout(() => {
                        self.formInstance = cmp.instance;
                        console.log(self.formInstance);
                    }, 100);*/
                });
            }
            , (error: any) => console.error(error)
        );
    }

    private isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }

    private executeSubmit(context: PersonalDetails) {
        return () => {
            if (context.employee.ID) {
                context.employeeService.Put(context.employee.ID, context.employee)
                    .subscribe(
                        (data: Employee) => {
                            context.employee = data;
                            context.whenFormInstance.then((instance: UniForm) => instance.refresh(context.employee));
                        },
                        (error: Error) => console.error('error in perosonaldetails.onSubmit - Put: ', error)
                    );
            } else {
                console.log('we are now Posting');
                console.log('Account number: ' + context.employee.BankAccounts[0].AccountNumber);
                context.employeeService.post(context.employee)
                    .subscribe(
                        (data: Employee) => {
                            context.employee = data;
                            this.router.navigateByUrl('/salary/employees/' + context.employee.ID);
                        },
                        (error: Error) => console.error('error in personaldetails.onSubmit - Post: ', error)
                    );
            }
        }
        
        // this.formInstance.updateModel();
    }

    private toggleMode() {
        this.form.isEditable() ? this.form.readmode() : this.form.editmode();
    }
}
