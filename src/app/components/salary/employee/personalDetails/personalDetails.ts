import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniForm } from 'uniform-ng2/main';
import { OperationType, Operator, ValidationLevel, Employee, Email, Phone, Address, Municipal, SubEntity } from '../../../../unientities';
import { EmployeeService, MunicipalService } from '../../../../services/services';
import { AddressModal, EmailModal, PhoneModal } from '../../../common/modals/modals';
import { TaxCardModal } from '../modals/taxCardModal';
import { UniFieldLayout } from 'uniform-ng2/main';

import { UniView } from '../../../../../framework/core/uniView';
import { UniCacheService } from '../../../../services/services';
import {ErrorService} from '../../../../services/common/ErrorService';
declare var _;

@Component({
    selector: 'employee-personal-details',
    templateUrl: 'app/components/salary/employee/personalDetails/personalDetails.html'
})
export class PersonalDetails extends UniView {

    public busy: boolean;
    public expands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'BankAccounts',
    ];
    public config: any = {};
    public fields: any[] = [];
    private subEntities: SubEntity[];
    private municipalities: Municipal[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(TaxCardModal) public taxCardModal: TaxCardModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;


    private employee: Employee;

    constructor(
        private employeeService: EmployeeService,
        private router: Router,
        private municipalService: MunicipalService,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService
    ) {

        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            super.getStateSubject('employee').subscribe(
                employee => this.employee = employee,
                err => this.errorService.handle(err)
            );

            super.getStateSubject('subEntities').subscribe((subEntity: SubEntity[]) => {
                this.subEntities = subEntity;
                this.getLayout();
            }, err => this.errorService.handle(err));
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
                        1: { isOpen: true },
                        2: { isOpen: true }
                    }
                };

                this.fields = layout.Fields;
                this.extendFormConfig();

            }
            , err => this.errorService.handle(err)
        );
    }

    public onFormReady(value) {
        // TODO: Cache focused field and reset to this?
        this.uniform.field('BusinessRelationInfo.Name').focus();
    }

    public onFormChange(employee: Employee) {
        if (this.employee.BankAccounts[0]) {
            if (!this.employee.BankAccounts[0].AccountNumber) {
                this.employee.BankAccounts[0].Active = false;
            } else {
                this.employee.BankAccounts[0].Active = true;
            }
        }
        setTimeout(() => {
            this.updateInfoFromSSN();
        })
        this.employee = _.cloneDeep(employee);
        super.updateState('employee', employee, true);
    }

    private extendFormConfig() {
        const subEntityField = this.fields.find(field => field.Property === 'SubEntityID');
        subEntityField.Options.source = this.subEntities;

        let multiValuePhone: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.DefaultPhone');
        let phoneModalSubscription;
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
                if (!phoneModalSubscription) {
                    phoneModalSubscription = this.phoneModal.Changed.subscribe(modalval => {
                        resolve(modalval);
                    });
                }
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

        let emailModalSubscription;
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

                if (!emailModalSubscription) {
                    emailModalSubscription = this.emailModal.Changed.subscribe(modalval => {
                        resolve(modalval);
                    });
                }
            })
        };

        let multiValueAddress: UniFieldLayout = this.findByProperty(this.fields, 'BusinessRelationInfo.InvoiceAddress');

        let addressModalSubscription;
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

                if (!addressModalSubscription) {
                    addressModalSubscription = this.addressModal.Changed.subscribe(modalval => {
                        resolve(modalval);
                    });
                }

            }),
            display: (address: Address) => {

                let displayVal = (address.AddressLine1 ? address.AddressLine1 + ', ' : '') + (address.PostalCode || '') + ' ' + (address.City || '') + (address.CountryCode ? ', ' + address.CountryCode : '');
                return displayVal;
            }

        };

        let taxButton: UniFieldLayout = this.findByProperty(this.fields, 'TaxBtn');
        taxButton.Options = {
            click: (event) => {
                this.openTaxCardModal();
            }
        };

        let municipality: UniFieldLayout = this.findByProperty(this.fields, 'MunicipalityNo');

        this.municipalService.GetAll('').subscribe(items => {
            municipality.Options = {
                source: items, // this.municipalService,
                search: (query: string) => this.municipalService.GetAll(`filter=startswith(MunicipalityNo, '${query}') or contains(MunicipalityName, '${query}')&top=50`),
                valueProperty: 'MunicipalityNo',
                displayProperty: 'MunicipalityNo',
                debounceTime: 200,
                template: (obj: Municipal) => obj ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase() + obj.MunicipalityName.substr(1).toLowerCase()}` : ''
            };
            this.fields = _.cloneDeep(this.fields);
        }, err => this.errorService.handle(err));



    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private updateInfoFromSSN() {
        if (this.employee.SocialSecurityNumber && this.employee.SocialSecurityNumber.length === 11) {

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

            this.employee = _.cloneDeep(this.employee);
            super.updateState('employee', this.employee, true);
        }

    }

    public openTaxCardModal() {
        this.taxCardModal.openModal();
    }

    public refreshEmployee() {
        if (this.employee) {
            this.employeeService.get(this.employee.ID).subscribe((employee: Employee) => {
                this.employee.TaxPercentage = employee.TaxPercentage;
                this.employee.TaxTable = employee.TaxTable;
                this.employee.NonTaxableAmount = employee.NonTaxableAmount;
                this.employee.MunicipalityNo = employee.MunicipalityNo;
                this.employee.NotMainEmployer = employee.NotMainEmployer;
                this.updateState('employee', employee);
            }, err => this.errorService.handle(err));
        }
    }
}
