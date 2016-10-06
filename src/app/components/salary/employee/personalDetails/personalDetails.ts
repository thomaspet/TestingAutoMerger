import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniForm} from '../../../../../framework/uniform';
import {OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address, Municipal} from '../../../../unientities';
import {EmployeeService, MunicipalService} from '../../../../services/services';
import {AddressModal, EmailModal, PhoneModal} from '../../../common/modals/modals';
import {TaxCardRequestModal, ReadTaxCardModal} from '../employeeModals';
import {UniFieldLayout} from '../../../../../framework/uniform/index';

import {UniView} from '../../../../../framework/core/uniView';
import {UniCacheService} from '../../../../services/services';
declare var _;

@Component({
    selector: 'employee-personal-details',
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails extends UniView  {

    public busy: boolean;
    public expands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'BankAccounts',
    ];

    public config: any = {};
    public fields: any[] = [];
    private subEntities: any[];
    private municipalities: Municipal[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    @ViewChild(ReadTaxCardModal) public taxCardModal: ReadTaxCardModal;
    @ViewChild(TaxCardRequestModal) public taxCardRequestModal: TaxCardRequestModal;

    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    private employee: Employee;

    constructor(private employeeService: EmployeeService,
                private router: Router,
                private municipalService: MunicipalService,
                route: ActivatedRoute,
                cacheService: UniCacheService) {

        super(router.url, cacheService);
        this.setupForm();

        // Update cache key and (re)subscribe when param changes (different employee)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            super.getStateSubject('employee').subscribe((employee) => {
                this.employee = _.cloneDeep(employee);
            });
        });
    }

    private setupForm() {
        this.employeeService.getSubEntities().subscribe((subEntities) => {
            this.subEntities = subEntities;
            this.getLayout();
        });
    }

    private getLayout() {
        this.employeeService.layout('EmployeePersonalDetailsForm').subscribe(
            (layout: any) => {
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
                this.config = {
                    submitText: '',
                    sections: {
                        1: {isOpen: true},
                        2: {isOpen: true}
                    }
                };
                this.municipalService.GetAll(null).subscribe((municipalities: Municipal[]) => {
                    this.fields = layout.Fields;
                    this.municipalities = municipalities;
                    this.extendFormConfig();
                });

            }
            , (error: any) => {
                console.error(error);
                this.log(error);
            }
        );
    }

    public onFormReady(value) {
        // TODO: Cache focused field and reset to this?
        this.uniform.field('BusinessRelationInfo.Name').focus();
        this.uniform.field('SocialSecurityNumber').onChange.subscribe(() => {
            this.updateInfoFromSSN();
        });
        this.uniform.field('BankAccounts[0].AccountNumber').onChange.subscribe(() => {
            if (!this.employee.BankAccounts[0].AccountNumber) {
                this.employee.BankAccounts[0].Active = false;
            } else {
                this.employee.BankAccounts[0].Active = true;
            }
        });
    }

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    public onFormChange(employee: Employee) {
        if (employee.BirthDate) {
            employee.BirthDate = this.fixTimezone(employee.BirthDate);
        }

        super.updateState('employee', employee, true);
    }

    private extendFormConfig() {
        const subEntityField = this.fields.find(field => field.Property === 'SubEntityID');
        subEntityField.Options.source = this.subEntities;

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
                this.openTaxCardRequestModal();
            }
        };

        let getTaxCardBtn: UniFieldLayout = this.findByProperty(this.fields, 'GetTaxCardBtn');

        getTaxCardBtn.Options = {
            click: (event) => {
                this.openReadTaxCardModal();
            }
        };

        let municipality: UniFieldLayout = this.findByProperty(this.fields, 'MunicipalityNo');

        municipality.Options = {
            source: this.municipalities,
            valueProperty: 'MunicipalityNo',
            displayProperty: 'MunicipalityNo',
            debounceTime: 200,
            template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase() + obj.MunicipalityName.substr(1).toLowerCase()}` : ''
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

            super.updateState('employee', this.employee, true);
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