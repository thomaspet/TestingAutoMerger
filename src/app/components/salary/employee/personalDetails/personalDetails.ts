import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniForm} from '../../../../../framework/uniform';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address, BusinessRelation} from '../../../../unientities';
import {EmployeeService, PhoneService, EmailService, AddressService, AltinnService, SubEntityService} from '../../../../services/services';
import {AddressModal} from '../../../sales/customer/modals/address/address';
import {EmailModal} from '../../../sales/customer/modals/email/email';
import {PhoneModal} from '../../../sales/customer/modals/phone/phone';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import {TaxCardRequestModal} from '../modals/taxCardRequestModal';

declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniForm, UniSave, TaxCardRequestModal],
    providers: [EmployeeService, PhoneService, EmailService, AddressService, AltinnService, SubEntityService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails {
    
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    
    private employee: Employee;
    
    private emptyPhone: Phone;
    private emptyEmail: Email;
    private emptyAddress: Address;
    
    private employeeID: any;
    
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: this.saveEmployee.bind(this),
            main: true,
            disabled: true
        }
    ];
    
    constructor(public rootRouteParams: RootRouteParamsService,
                public employeeService: EmployeeService,
                public router: Router,
                public phoneService: PhoneService,
                public emailService: EmailService,
                public addressService: AddressService,
                public altinnService: AltinnService,
                public subEntityService: SubEntityService) {
        this.employeeID = +rootRouteParams.params.get('id');
        
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
                this.fields = layout.Fields;
                this.config = {
                    submitText: ''
                };
                
                this.extendFormConfig();
            }
            , (error: any) => console.error(error)
        );
    }
    
    private extendFormConfig() {
        
        var multiValuePhone = new UniFieldLayout();
        multiValuePhone.FieldSet = 0;
        multiValuePhone.Section = 0;
        multiValuePhone.Combo = 0;
        multiValuePhone.FieldType = 14;
        multiValuePhone.Label = 'Telefon';
        multiValuePhone.Property = 'BusinessRelationInfo.Phones';
        multiValuePhone.ReadOnly = false;
        multiValuePhone.Placeholder = 'Legg til telefon';
        multiValuePhone.Options = {
            entity: Phone,
            displayValue: 'Number',
            linkProperty: 'BusinessRelationInfo.DefaultPhoneID',
            foreignProperty: 'BusinessRelationInfo.DefaultPhone',
            // editor: (value) => new Promise((resolve) => {
            //     var x: BusinessRelation = new BusinessRelation();
            //     x.Name = value;
            //     resolve(x);
            // })
            editor: (PhoneModal)
        };
        
        // var phones: any = this.fields.find('Phones');
        // var phones: FieldLayout = this.find('Phones');
        // phones.Options
        // phones.Options = {
        //     dataTextField: 'Number',
        //     dataValueField: 'ID'
        // }
            // .setModel(this.employee.BusinessRelationInfo)
            // .setModelField('Phones')
            // .setModelDefaultField('DefaultPhoneID')
            // .setPlaceholder(this.emptyPhone)
            // .setEditor(PhoneModal)     
            // .onSelect = (phone: Phone) => {
            //     this.employee.BusinessRelationInfo.DefaultPhone = phone;
            //     this.employee.BusinessRelationInfo.DefaultPhoneID = null;
            // };
        
        // var emails: any = this.fields.find('Emails');
        // var emails: FieldLayout = this.find('Emails');
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
        
        // // var address: any = this.fields.find('Addresses');
        // var address: FieldLayout = this.find('Addresses');
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
        
        this.fields = [multiValuePhone, ...this.fields];
        
        this.fields = _.cloneDeep(this.fields);
    }
    
    public ready(value) {
        console.log('form ready', value);
    }
    
    public change(value) {
        console.log('uniform changed', value);
        this.saveactions[0].disabled = false;
    }
    
    private saveEmployee(done) {
        done('Lagrer persondetaljer');
        if (this.employee.ID > 0) {
            this.employeeService.Put(this.employee.ID, this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                done('Sist lagret: ');
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil ved oppdatering av ansatt', err);
            });
        } else {
            this.employeeService.Post(this.employee)
            .subscribe((response: Employee) => {
                this.employee = response;
                done('Sist lagret: ');
                this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
            },
            (err) => {
                console.log('Feil ved lagring', err);
            });
        }
    }
}
