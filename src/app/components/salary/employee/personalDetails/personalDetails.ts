import {Component, ViewChild, ComponentRef, OnInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UniFormBuilder, UniFormLayoutBuilder, UniFieldBuilder} from '../../../../../framework/forms';
import {UniComponentLoader} from '../../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address} from '../../../../unientities';
import {EmployeeService, PhoneService, EmailService, AddressService, AltinnService, SubEntityService} from '../../../../services/services';
import {AddressModal} from '../../../sales/customer/modals/address/address';
import {EmailModal} from '../../../sales/customer/modals/email/email';
import {PhoneModal} from '../../../sales/customer/modals/phone/phone';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniComponentLoader],
    providers: [EmployeeService, PhoneService, EmailService, AddressService, AltinnService, SubEntityService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails implements OnInit {

    private form: UniFormBuilder = new UniFormBuilder();
    private employee: Employee;
    private lastSavedInfo: string;
    
    private emptyPhone: Phone;
    private emptyEmail: Email;
    private emptyAddress: Address;

    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;

    private employeeID: any;
    private formInstance: UniForm;
    private whenFormInstance: Promise<UniForm>;

    constructor(public rootRouteParams: RootRouteParamsService,
                public employeeService: EmployeeService,
                public router: Router,
                public phoneService: PhoneService,
                public emailService: EmailService,
                public addressService: AddressService,
                public altinnService: AltinnService,
                public subEntityService: SubEntityService) {
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
        console.log('get data');
        Observable.forkJoin(
            this.employeeService.get(this.employeeID),
            this.employeeService.layout('EmployeePersonalDetailsForm'),
            this.phoneService.GetNewEntity(),
            this.emailService.GetNewEntity(),
            this.addressService.GetNewEntity()
            //this.subEntityService.getMainOrganization()
        ).subscribe(
            (response: any) => {
                console.log('gets data');
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
                console.log('gets data2');
                this.employee = employee;
                this.emptyPhone = emptyPhone;
                this.emptyEmail = emptyMail;
                this.emptyAddress = emptyAddress;
                this.form = new UniFormLayoutBuilder().build(layout, this.employee);
                this.form.hideSubmitButton();
                console.log('gets data3');
                this.extendFormConfig();
                
                console.log('sending tax request');
                this.altinnService.sendTaxRequest([this.employee]).subscribe((altinnResponse) => {
                    console.log(JSON.stringify('response from tax request: ' + JSON.stringify(altinnResponse)));
                }, (error: any) => console.log(error));
                
                /*this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
                    
                    cmp.instance.config = this.form;
                    this.whenFormInstance = new Promise((resolve: Function) => {
                        resolve(cmp.instance);
                    });
                    this.formInstance = cmp.instance;
                });*/
                
            }
            , (error: any) => console.error(error)
        );
    }
    
    private extendFormConfig() {
        var phones: UniFieldBuilder = this.form.find('Phones');
        phones
            .setKendoOptions({
                dataTextField: 'Number',
                dataValueField: 'ID'
            })
            .setModel(this.employee.BusinessRelationInfo)
            .setModelField('Phones')
            .setModelDefaultField('DefaultPhoneID')
            .setPlaceholder(this.emptyPhone)
            .setEditor(PhoneModal)     
            .onSelect = (phone: Phone) => {
                this.employee.BusinessRelationInfo.DefaultPhone = phone;
                this.employee.BusinessRelationInfo.DefaultPhoneID = null;
            };
        var emails: UniFieldBuilder = this.form.find('Emails');
        emails
            .setKendoOptions({
                dataTextField: 'EmailAddress',
                dataValueField: 'ID'
            })
            .setModel(this.employee.BusinessRelationInfo)
            .setModelField('Emails')
            .setModelDefaultField('DefaultEmailID')
            .setPlaceholder(this.emptyEmail)
            .setEditor(EmailModal)
            .onSelect = (email: Email) => {
                this.employee.BusinessRelationInfo.DefaultEmail = email;
                this.employee.BusinessRelationInfo.DefaultEmailID = null;
            };
        var address: UniFieldBuilder = this.form.find('Addresses');
        address
            .setKendoOptions({
                dataTextField: 'AddressLine1',
                dataValueField: 'ID'
            })
            .setModel(this.employee.BusinessRelationInfo)
            .setModelField('Addresses')
            .setModelDefaultField('InvoiceAddressID') 
            .setPlaceholder(this.emptyAddress)
            .setEditor(AddressModal)     
            .onSelect = (addressValue: Address) => {
                this.employee.BusinessRelationInfo.InvoiceAddress = addressValue;
                this.employee.BusinessRelationInfo.InvoiceAddressID = null;
            };
    }

    public isValid() {
        return this.formInstance && this.formInstance.form && this.formInstance.form.valid;
    }
    
    public saveEmployeeManual() {
        this.saveEmployee();
    }
    
    private saveEmployee() {
        this.formInstance.sync();
        this.lastSavedInfo = 'Lagrer persondetaljer på den ansatte';
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
