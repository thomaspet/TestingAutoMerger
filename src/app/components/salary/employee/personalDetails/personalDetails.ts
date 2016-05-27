import {Component, ViewChild, ComponentRef, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniForm} from '../../../../../framework/uniform';
// import {UniFormBuilder, UniFormLayoutBuilder, UniFieldBuilder} from '../../../../../framework/forms';
import {UniComponentLoader} from '../../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address, FieldLayout} from '../../../../unientities';
import {EmployeeService, PhoneService, EmailService, AddressService} from '../../../../services/services';
import {AddressModal} from '../../../sales/customer/modals/address/address';
import {EmailModal} from '../../../sales/customer/modals/email/email';
import {PhoneModal} from '../../../sales/customer/modals/phone/phone';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';

declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniForm, UniSave],
    providers: [EmployeeService, PhoneService, EmailService, AddressService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails implements OnInit {
    
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    
    // private form: UniFormBuilder = new UniFormBuilder();
    private employee: Employee;
    private lastSavedInfo: string;
    
    private emptyPhone: Phone;
    private emptyEmail: Email;
    private emptyAddress: Address;

    // @ViewChild(UniComponentLoader)
    // private uniCmpLoader: UniComponentLoader;
    
    private employeeID: any;
    // private formInstance: UniForm;
    // private whenFormInstance: Promise<UniForm>;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: this.saveEmployee,
            main: true,
            disabled: true
        }
    ];
    
    constructor(public rootRouteParams: RootRouteParamsService,
                public employeeService: EmployeeService,
                public router: Router,
                public phoneService: PhoneService,
                public emailService: EmailService,
                public addressService: AddressService) {
        this.employeeID = +rootRouteParams.params.get('id');
        
        // // set model
        // employeeService.get(this.employeeID).toPromise().then((employee: Employee) => this.employee = employee);
        // // set fields from layout
        // employeeService.layout('EmployeeDetailsForm').toPromise().then((layout: any) => {
        //     this.fields = layout.Fields;
        // });
        
        if (this.employeeService.subEntities) {
            this.getData();
        }else {
            this.cacheLocAndGetData();
        }
    }
    
    public ngOnInit() {
        // if (this.employeeService.subEntities) {
        //     this.getData();
        // }else {
        //     this.cacheLocAndGetData();
        // }
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
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity()
        ).subscribe(
            (response: any) => {
                var [employee, layout, emptyPhone, emptyMail, emptyAddress] = response;
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
                this.emptyEmail = emptyMail;
                this.emptyAddress = emptyAddress;
                // this.form = new UniFormLayoutBuilder().build(layout, this.employee);
                // this.form.hideSubmitButton();
                
                // new uniform
                this.fields = layout.Fields;
                this.config = {
                    submitText: 'Lagre ansatt'
                };
                
                
                // this.extendFormConfig();
                // this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
                //     cmp.instance.config = this.form;
                //     this.whenFormInstance = new Promise((resolve: Function) => {
                //         resolve(cmp.instance);
                //     });
                //     this.formInstance = cmp.instance;
                // });
            }
            , (error: any) => console.error(error)
        );
    }
    
    private extendFormConfig() {
        // var phones: any = this.fields.find('Phones');
        // var phn: FieldLayout = this.uniform.find('Phones');
        // phones
        //     .setKendoOptions({
        //         dataTextField: 'Number',
        //         dataValueField: 'ID'
        //     })
        //     .setModel(this.employee.BusinessRelationInfo)
        //     .setModelField('Phones')
        //     .setModelDefaultField('DefaultPhoneID')
        //     .setPlaceholder(this.emptyPhone)
        //     .setEditor(PhoneModal)     
        //     .onSelect = (phone: Phone) => {
        //         this.employee.BusinessRelationInfo.DefaultPhone = phone;
        //         this.employee.BusinessRelationInfo.DefaultPhoneID = null;
        //     };
        
        // var emails: UniFieldBuilder = this.form.find('Emails');
        // emails
        //     .setKendoOptions({
        //         dataTextField: 'EmailAddress',
        //         dataValueField: 'ID'
        //     })
        //     .setModel(this.employee.BusinessRelationInfo)
        //     .setModelField('Emails')
        //     .setModelDefaultField('DefaultEmailID')
        //     .setPlaceholder(this.emptyEmail)
        //     .setEditor(EmailModal)
        //     .onSelect = (email: Email) => {
        //         this.employee.BusinessRelationInfo.DefaultEmail = email;
        //         this.employee.BusinessRelationInfo.DefaultEmailID = null;
        //     };
        
        // var address: UniFieldBuilder = this.form.find('Addresses');
        // address
        //     .setKendoOptions({
        //         dataTextField: 'AddressLine1',
        //         dataValueField: 'ID'
        //     })
        //     .setModel(this.employee.BusinessRelationInfo)
        //     .setModelField('Addresses')
        //     .setModelDefaultField('InvoiceAddressID') 
        //     .setPlaceholder(this.emptyAddress)
        //     .setEditor(AddressModal)     
        //     .onSelect = (addressValue: Address) => {
        //         this.employee.BusinessRelationInfo.InvoiceAddress = addressValue;
        //         this.employee.BusinessRelationInfo.InvoiceAddressID = null;
        //     };
    }

    // public isValid() {
    //     return this.formInstance; // && this.formInstance.form && this.formInstance.form.valid;
    // }
    
    public ready(value) {
        console.log('form ready', value);
    }
    
    public change(value) {
        console.log('uniform changed', value);
        this.saveactions[0].disabled = false;
    }
    
    public saveEmployeeManual(done) {
        console.log('save manually', done);
        this.saveEmployee(done);
    }
    
    private saveEmployee(done) {
        // this.formInstance.sync();
        console.log('employee to save', this.employee);
        //this.lastSavedInfo = 'Lagrer persondetaljer på den ansatte';
        done('Lagrer persondetaljer på den ansatte');
        if (this.employee.ID > 0) {
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
