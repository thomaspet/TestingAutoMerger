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
import {TaxCardRequestModal, AltinnLoginModal, ReadTaxCardModal} from '../employeeModals';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniForm, UniSave, TaxCardRequestModal, AltinnLoginModal, ReadTaxCardModal, PhoneModal, AddressModal, EmailModal],
    providers: [EmployeeService, PhoneService, EmailService, AddressService, AltinnService, SubEntityService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails {
    
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    @ViewChild(ReadTaxCardModal) public taxCardModal: ReadTaxCardModal;
    @ViewChild(TaxCardRequestModal) public taxCardRequestModal: TaxCardRequestModal;

    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    private employee: Employee;
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

        let multiValuePhone: UniFieldLayout = this.findByProperty(this.fields, 'DefaultPhone');
        
        multiValuePhone.Options = {
            entity: Phone,
            listProperty: 'BusinessRelationInfo.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            foreignProperty: 'BusinessRelationInfo.DefaultPhoneID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Phone();
                    value.ID = 0;
                }
                                
                this.phoneModal.openModal(value);
                
                this.phoneModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                }); 
            })
        };
        
        let multiValueEmail: UniFieldLayout = this.findByProperty(this.fields, 'DefaultEmail');

        multiValueEmail.Options = {
            entity: Email,
            listProperty: 'BusinessRelationInfo.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            foreignProperty: 'BusinessRelationInfo.DefaultEmailID',            
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Email();
                    value.ID = 0;
                }
                                
                this.emailModal.openModal(value);
                
                this.emailModal.Changed.subscribe(modalval => {                                       
                    resolve(modalval);    
                });               
            })
        };

        let multiValueAddress: UniFieldLayout = this.findByProperty(this.fields, 'InvoiceAddress');
        
        multiValueAddress.Options = {
            entity: Address,
            listProperty: 'BusinessRelationInfo.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            foreignProperty: 'BusinessRelationInfo.InvoiceAddressID',            
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }
                                
                this.addressModal.openModal(value);
                
                this.addressModal.Changed.subscribe(modalval => {
                    console.log('modalval: ', modalval);
                    if (modalval) {
                        resolve(modalval);
                    }        
                });               
            }),
            display: (address: Address) => {
                                
                let displayVal = (address.AddressLine1 ? address.AddressLine1 + ', ' : '') + (address.PostalCode || '') + ' ' + (address.City || '');
                return displayVal;                  
            }  
        };
        
        this.fields = _.cloneDeep(this.fields);
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field; 
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

    public openReadTaxCardModal() {
        this.taxCardModal.openModal();
    }

    public openTaxCardRequestModal() {
        this.taxCardRequestModal.openModal();
    }
}
