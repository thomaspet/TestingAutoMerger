import {Component, Injector, ViewChild, ComponentRef, OnInit} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFormBuilder, UniFormLayoutBuilder, UniFieldBuilder} from '../../../../../framework/forms';
import {UniComponentLoader} from '../../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address} from '../../../../unientities';
import {EmployeeService, PhoneService} from '../../../../services/services';
import {AddressModal} from '../../../sales/customer/modals/address/address';
import {EmailModal} from '../../../sales/customer/modals/email/email';
import {PhoneModal} from '../../../sales/customer/modals/phone/phone';
declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    providers: [EmployeeService],
    template: `
        <article class='application usertest'>
            <uni-component-loader></uni-component-loader>
        </article>
    `
})
export class PersonalDetails implements OnInit {

    private form: UniFormBuilder = new UniFormBuilder();
    private employee: Employee;
    private emptyPhone: Phone;

    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;

    private employeeID: any;
    private formInstance: UniForm;
    private whenFormInstance: Promise<UniForm>;

    constructor(public injector: Injector,
                public employeeService: EmployeeService,
                public router: Router,
                public phoneService: PhoneService) {
        // any way to get that in an easy way????
        var routeParams = this.injector.parent.parent.get(RouteParams);
        this.employeeID = +routeParams.get('id');
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
            this.employeeService.layout('EmployeePersonalDetailsForm'),
            this.phoneService.GetNewEntity()
        ).subscribe(
            (response: any) => {
                var [employee, layout, emptyPhone] = response;
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
                this.emptyPhone = emptyPhone;
                this.form = new UniFormLayoutBuilder().build(layout, this.employee);
                this.extendFormConfig();
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = this.form;
                    cmp.instance.getEventEmitter().subscribe(this.executeSubmit(this));
                    this.whenFormInstance = new Promise((resolve: Function) => {
                        resolve(cmp.instance);
                    });
                });
            }
            , (error: any) => console.error(error)
        );
    }
    
    private extendFormConfig(){
        var phones: UniFieldBuilder = this.form.find('BusinessRelationInfo.Phones');
        phones
            .setKendoOptions({
                dataTextField: 'Number',
                dataValueField: 'ID'
            })
            .setModel(this.employee)
            .setModelField('BusinessRelationInfo.Phones')
            .setModelDefaultField('DefaultPhoneID')
            .setPlaceholder(this.emptyPhone)
            .setEditor(PhoneModal);     
        phones.onSelect = (phone: Phone) => {
            this.employee.BusinessRelationInfo.DefaultPhone = phone;
            this.employee.BusinessRelationInfo.DefaultPhoneID = null;
        };
    }

    public isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }

    private executeSubmit(context: PersonalDetails) {
        return () => {
            if (context.employee.ID) {
                context.employeeService.Put(context.employee.ID, context.employee)
                    .subscribe(
                        (data: Employee) => {
                            context.employee = data;
                            context.whenFormInstance.then((instance: UniForm) => {
                                instance.Model = context.employee;
                            });
                        },
                        (error: Error) => {
                            console.error('error in perosonaldetails.onSubmit - Put: ', error);
                        }
                    );
            } else {
                context.employeeService.Post(context.employee)
                    .subscribe(
                        (data: Employee) => {
                            context.employee = data;
                            this.router.navigateByUrl('/salary/employees/' + context.employee.ID);
                        },
                        (error: Error) => {
                            console.error('error in personaldetails.onSubmit - Post: ', error);
                        }
                    );
            }
        };
    }
}
