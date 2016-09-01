import {Component, ViewChild, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {UniForm} from '../../../../../framework/uniform';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/merge';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address} from '../../../../unientities';
import {EmployeeService, PhoneService, EmailService, AddressService, AltinnIntegrationService, SubEntityService} from '../../../../services/services';
import {AddressModal, EmailModal, PhoneModal} from '../../../common/modals/modals';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {TaxCardRequestModal, AltinnLoginModal, ReadTaxCardModal} from '../employeeModals';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
declare var _;

@Component({
    selector: 'employee-personal-details',
    directives: [UniForm, UniSave, TaxCardRequestModal, AltinnLoginModal, ReadTaxCardModal, PhoneModal, AddressModal, EmailModal],
    providers: [PhoneService, EmailService, AddressService, AltinnIntegrationService, SubEntityService],
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails implements OnDestroy {

    public busy: boolean;
    public expands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'BankAccounts',
    ];

    public config: any = {};
    public fields: any[] = [];
    private subscription: Subscription;
    @ViewChild(UniForm) public uniform: UniForm;

    @ViewChild(ReadTaxCardModal) public taxCardModal: ReadTaxCardModal;
    @ViewChild(TaxCardRequestModal) public taxCardRequestModal: TaxCardRequestModal;

    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    private employee: Employee;
    private employeeID: number;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: this.saveEmployee.bind(this),
            main: true,
            disabled: false
        }
    ];

    constructor(
        public rootRouteParams: RootRouteParamsService,
        public employeeService: EmployeeService,
        public router: Router,
        public phoneService: PhoneService,
        public emailService: EmailService,
        public addressService: AddressService,
        public altinnService: AltinnIntegrationService,
        public subEntityService: SubEntityService) {
        this.employeeID = +rootRouteParams.params['id'];

        this.employeeService.routeEnding = 'personal-details';

        this.subscription = this.employeeService.employee$.subscribe((emp) => {
            this.employee = emp;
        });

        if (this.employeeService.subEntities) {
            this.getData();
        } else {
            this.cacheLocAndGetData();
        }
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private cacheLocAndGetData() {
        this.employeeService.getSubEntities().subscribe((response) => {
            this.employeeService.subEntities = response;
            this.employeeService.subEntities.unshift([{ ID: 0 }]);
            this.getData();
        });
    }

    private getData() {
        this.busy = true;
        Observable.forkJoin(
            this.employeeService.get(this.employeeID, this.expands),
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
                this.employeeService.refreshEmployee(employee);
                this.fields = layout.Fields;
                this.config = {
                    submitText: ''
                };

                this.extendFormConfig();
                this.busy = false;
            }
            , (error: any) => {
                console.error(error);
                this.log(error);
            }
            );
    }


    private extendFormConfig() {

        let multiValuePhone: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.DefaultPhone');

        multiValuePhone.Options = {
            entity: Phone,
            listProperty: 'BusinessRelationInfo.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultPhoneID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Phone();
                    value.ID = 0;
                }

                this.phoneModal.openModal(value);

                this.phoneModal.Changed.subscribe(modalval => {
                    resolve(modalval);
                });
            }),
            display: (phone: Phone) => {
                let displayVal = '';
                if (phone.Number) {
                    displayVal = (phone.CountryCode && phone.Number.substr(0, 3) !== phone.CountryCode ? phone.CountryCode + ' ' : '') + phone.Number;
                }
                return displayVal;
            }
        };

        let multiValueEmail: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.DefaultEmail');

        multiValueEmail.Options = {
            entity: Email,
            listProperty: 'BusinessRelationInfo.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultEmailID',
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

        let multiValueAddress: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.InvoiceAddress');

        multiValueAddress.Options = {
            entity: Address,
            listProperty: 'BusinessRelationInfo.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value) {
                    value = new Address();
                    value.ID = 0;
                }

                this.addressModal.openModal(value);

                this.addressModal.Changed.subscribe(modalval => {

                    resolve(modalval);
                });
            }),
            display: (address: Address) => {

                let displayVal = (address.AddressLine1 ? address.AddressLine1 + ', ' : '') + (address.PostalCode || '') + ' ' + (address.City || '') + (address.CountryCode ? ', ' + address.CountryCode : '');
                return displayVal;
            }
        };

        let taxRequestBtn: UniFieldLayout = this.findByProperty(this.fields, 'TaxRequestBtn');
        taxRequestBtn.Options = {
            click: (event) => {
                this.openTaxCardRequestModal()
            }
        };

        let getTaxCardBtn: UniFieldLayout = this.findByProperty(this.fields, 'GetTaxCardBtn');

        getTaxCardBtn.Options = {
            click: (event) => {
                this.openReadTaxCardModal();
            }
        };

        this.fields = _.cloneDeep(this.fields);
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private updateInfoFromSSN() {

        if (this.employee.SocialSecurityNumber.length === 11) {
            
            let day: number = +this.employee.SocialSecurityNumber.substring(0, 2);
            let month: number = +this.employee.SocialSecurityNumber.substring(2, 4);
            let year: number = +this.employee.SocialSecurityNumber.substring(4, 6);
            let controlNumbers: number = +this.employee.SocialSecurityNumber.substring(6, 9);

            let yearToday = +new Date().getFullYear().toString().substring(2, 4);

            if (year < yearToday) {
                let fullYear: string = new Date().getFullYear().toString().substring(0, 2) + (year < 10 ? '0' + year.toString() : year.toString());
                year = +fullYear;
            }

            if (year && month && day) {
                if (month > 0) {
                    month -= 1;
                }
                this.employee.BirthDate = new Date(year, month, day, 12);
            }

            this.employee.Sex = (controlNumbers % 2) + 1;
        }

    }

    public ready(value) {
        setTimeout(() => {
            if (!this.uniform.section(1).isOpen) {
                this.uniform.section(1).toggle();
            }
            if (!this.uniform.section(2).isOpen) {
                this.uniform.section(2).toggle();
            }
        }, 100);

        this.uniform.field('BusinessRelationInfo.Name').focus();
        this.uniform.field('SocialSecurityNumber').onChange.subscribe(() => {
            this.updateInfoFromSSN();
        });
    }

    public change(value) {
        this.employee = _.cloneDeep(this.employee);
    }

    private saveEmployee(done) {
        this.saveactions[0].disabled = true;
        if (this.employee.BankAccounts[0] && !this.employee.BankAccounts[0].ID) {
            let bankAccount = this.employee.BankAccounts[0];
            bankAccount.Active = true;
            bankAccount['_createguid'] = this.employeeService.getNewGuid();
        }

        this.employee.BusinessRelationInfo.Emails.forEach(email => {
            if (email.ID === 0) {
                email['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        if (this.employee.BusinessRelationInfo.DefaultEmail) {
            this.employee.BusinessRelationInfo.Emails = this.employee.BusinessRelationInfo.Emails.filter(x => x !== this.employee.BusinessRelationInfo.DefaultEmail);
        }

        this.employee.BusinessRelationInfo.Phones.forEach(phone => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        if (this.employee.BusinessRelationInfo.DefaultPhone) {
            this.employee.BusinessRelationInfo.Phones = this.employee.BusinessRelationInfo.Phones.filter(x => x !== this.employee.BusinessRelationInfo.DefaultPhone);
        }

        this.employee.BusinessRelationInfo.Addresses.forEach(address => {
            if (address.ID === 0) {
                address['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        if (this.employee.BusinessRelationInfo.InvoiceAddress) {
            this.employee.BusinessRelationInfo.Addresses = this.employee.BusinessRelationInfo.Addresses.filter(x => x !== this.employee.BusinessRelationInfo.InvoiceAddress);
        }

        if (this.employee.BusinessRelationInfo.DefaultPhone === null && this.employee.BusinessRelationInfo.DefaultPhoneID === 0) {
            this.employee.BusinessRelationInfo.DefaultPhoneID = null;
        }

        if (this.employee.BusinessRelationInfo.DefaultEmail === null && this.employee.BusinessRelationInfo.DefaultEmailID === 0) {
            this.employee.BusinessRelationInfo.DefaultEmailID = null;
        }

        if (this.employee.BusinessRelationInfo.InvoiceAddress === null && this.employee.BusinessRelationInfo.InvoiceAddressID === 0) {
            this.employee.BusinessRelationInfo.InvoiceAddressID = null;
        }

        done('Lagrer persondetaljer');
        if (this.employee.ID > 0) {
            this.employeeService.Put(this.employee.ID, this.employee)
                .subscribe((response: Employee) => {
                    done('Sist lagret: ');
                    this.employeeService.get(this.employee.ID, this.expands).subscribe((emp: Employee) => {
                        this.employee = emp;
                        this.employeeService.refreshEmployee(emp);
                        this.saveactions[0].disabled = false;
                    },
                        (err) => {
                            console.log('Feil ved lagring av ansatt', err);
                            this.log(err);
                            this.saveactions[0].disabled = false;
                        });

                    this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
                },
                (err) => {
                    done('Feil ved lagring', err);
                    console.log('Feil ved oppdatering av ansatt', err);
                    this.log(err);
                    this.saveactions[0].disabled = false;
                });
        } else {
            this.employeeService.Post(this.employee)
                .subscribe((response: Employee) => {
                    this.employee = response;
                    this.employeeService.refreshEmployee(response);
                    done('Sist lagret: ');
                    this.saveactions[0].disabled = false;
                    this.router.navigateByUrl('/salary/employees/' + this.employee.ID);
                },
                (err) => {
                    done('Feil ved lagring', err);
                    console.log('Feil ved lagring av ansatt', err);
                    this.log(err);
                    this.saveactions[0].disabled = false;
                });
        }
    }

    public openReadTaxCardModal() {
        this.taxCardModal.openModal();
    }

    public openTaxCardRequestModal() {
        this.taxCardRequestModal.openModal();
    }

    public log(err) {
        alert(err._body);
    }
}
