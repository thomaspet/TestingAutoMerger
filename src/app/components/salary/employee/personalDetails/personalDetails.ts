import { Component, ViewChild, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniForm, UniFieldLayout } from '../../../../../framework/ui/uniform/index';
import { UniView } from '../../../../../framework/core/uniView';
import {
    OperationType, Operator, ValidationLevel, Employee, Email, Phone,
    Address, SubEntity, BankAccount, User
} from '../../../../unientities';
import { AddressModal, EmailModal, PhoneModal } from '../../../common/modals/modals';
import { Observable } from 'rxjs/Observable';

import {
    EmployeeService,
    MunicipalService,
    BankAccountService,
    BusinessRelationService,
    ErrorService,
    UniCacheService,
    UniSearchConfigGeneratorService,
    UserService
} from '../../../../services/services';
declare var _;
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BankAccountModal } from '../../../common/modals/modals';
import { UniField } from '../../../../../framework/ui/uniform/index';


@Component({
    selector: 'employee-personal-details',
    templateUrl: './personalDetails.html'
})
export class PersonalDetails extends UniView {

    public busy: boolean;
    public expands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.InvoiceAddress',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.DefaultEmail',
        'BusinessRelationInfo.Phones',
        'BusinessRelationInfo.DefaultPhone',
        'BusinessRelationInfo.BankAccounts',
        'BusinessRelationInfo.DefaultBankAccount',
    ];
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private employee$: BehaviorSubject<Employee> = new BehaviorSubject(new Employee());

    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    private employeeID: number;
    private collapseTax: boolean;

    constructor(
        private employeeService: EmployeeService,
        private router: Router,
        private municipalService: MunicipalService,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private bankaccountService: BankAccountService,
        private businessRelationService: BusinessRelationService,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService,
        private userService: UserService
    ) {

        super(router.url, cacheService);

        this.config$.next({
            submitText: '',
            sections: {
                1: { isOpen: true },
                2: { isOpen: true }
            }
        });

        // (re)subscribe when param changes (different tab)
        route.parent.params.subscribe((paramsChange) => {
            if (paramsChange['id'] === 0 || paramsChange['id'] === 'new') {
                this.employeeID = 0;
            } else {
                this.employeeID = +paramsChange['id'];
            }

            super.updateCacheKey(this.router.url);
            super.getStateSubject('employee')
                .subscribe(
                employee => {
                    this.employee$.next(employee);
                    this.showHideNameProperties(false);
                },
                err => this.errorService.handle(err)
                );

            if (!this.fields$.getValue().length) {
                Observable
                    .combineLatest(
                    super.getStateSubject('employee'),
                    super.getStateSubject('subEntities'))
                    .take(1)
                    .subscribe((result: [Employee, SubEntity[]]) => {
                        let [employee, subEntities] = result;
                        this.getLayout(subEntities, employee);
                    });
            }
        });
    }

    private getLayout(subEntities: SubEntity[], employee: Employee) {
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
                this.fields$.next(this.extendFormConfig(layout.Fields, subEntities, employee));
            }
            , err => this.errorService.handle(err)
        );

    }

    public onFormReady(value) {
        // TODO: Cache focused field and reset to this?
        if (this.employeeID > 0) {
            setTimeout(() => {
                this.uniform.field('BusinessRelationInfo.Name').focus();
            }, 200);
        } else {
            setTimeout(() => {
                const f: UniField = this.uniform.field('_EmployeeSearchResult');
                if (f) {
                    f.focus();
                } else {
                    this.uniform.field('BusinessRelationInfo.Name').focus();
                }
            }, 200);
        }
    }

    public onFormChange(changes: SimpleChanges) {
        this.employee$
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => {
                    let change = changes[key];
                    return change.previousValue !== change.currentValue;
                }))
            .map(employee => {
                if (changes['BusinessRelationInfo.DefaultBankAccountID']) {
                    this.businessRelationService.deleteRemovedBankAccounts(
                        changes['BusinessRelationInfo.DefaultBankAccountID'],
                        employee.BusinessRelationInfo
                    );
                }

                if (changes['_EmployeeSearchResult']) {
                    let searchResult = changes['_EmployeeSearchResult'].currentValue;
                    if (searchResult) {
                        employee = searchResult;
                        this.showHideNameProperties(true, employee);
                    }
                }

                // if the user has typed something in Name for a new employee, but has not
                // selected something from the list or clicked F3, the searchbox is still active,
                // so we need to get the value from there
                if (!employee.ID || employee.ID === 0) {
                    if (!employee.BusinessRelationInfo.Name || employee.BusinessRelationInfo.Name === '') {
                        let searchInfo = <any>this.uniform.field('_EmployeeSearchResult');
                        if (searchInfo) {
                            if (searchInfo.component && searchInfo.component.input) {
                                employee.BusinessRelationInfo.Name = searchInfo.component.input.value;
                                this.showHideNameProperties(false, employee);
                            }
                        }
                    }
                }

                if (changes['SocialSecurityNumber']) {
                    this.updateInfoFromSSN(employee);
                }

                return employee;
            })
            .subscribe(employee => super.updateState('employee', employee, true));
    }

    public showHideNameProperties(doUpdateFocus: boolean = false, employee: Employee = undefined, fields: any[] = undefined) {
        let refresh = !fields;
        fields = fields || this.fields$.getValue();
        employee = employee || this.employee$.getValue();

        let employeeSearchResult: UniFieldLayout = fields.find(x => x.Property === '_EmployeeSearchResult');
        let employeeName: UniFieldLayout = fields.find(x => x.Property === 'BusinessRelationInfo.Name');

        if (this.employeeID > 0 || (employee && employee.BusinessRelationInfo && employee.BusinessRelationInfo.Name !== null && employee.BusinessRelationInfo.Name !== '')) {
            if (employeeSearchResult) {
                employeeSearchResult.Hidden = true;
            }
            if (employeeName) {
                employeeName.Hidden = false;
            }

            if (doUpdateFocus) {
                setTimeout(() => {
                    const f: UniField = this.uniform.field('BusinessRelationInfo.Name');
                    if (f) {
                        f.focus();
                    }
                }, 200);
            }
        } else {
            if (employeeSearchResult) {
                employeeSearchResult.Hidden = false;
            }
            if (employeeName) {
                employeeName.Hidden = true;
            }

            if (doUpdateFocus) {
                setTimeout(() => {
                    const f: UniField = this.uniform.field('_EmployeeSearchResult');
                    if (f) {
                        f.focus();
                    }
                }, 200);
            }
        }

        if (refresh) {
            this.fields$.next(fields);
        }

        return fields;
    }

    private extendFormConfig(fields: any[], subEntities: SubEntity[], employee: Employee) {
        let subEntityField = fields.find(field => field.Property === 'SubEntityID');
        subEntityField.Options = {
            source: subEntities,
            valueProperty: 'ID',
            debounceTime: 200,
            template: (obj: SubEntity) =>
                obj && obj.BusinessRelationInfo
                ?
                obj.BusinessRelationInfo.Name
                    ? `${obj.OrgNumber} - ${obj.BusinessRelationInfo.Name}`
                    : `${obj.OrgNumber}`
                : ''
        }

        let multiValuePhone: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.DefaultPhone');
        let phoneModalSubscription;
        multiValuePhone.Options = {
            entity: Phone,
            listProperty: 'BusinessRelationInfo.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultPhone',
            storeIdInProperty: 'BusinessRelationInfo.DefaultPhoneID',
            editor: (value) => new Promise((resolve) => {
                if (!value || !value.ID) {
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

        let multiValueEmail: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.DefaultEmail');
        let emailModalSubscription;
        multiValueEmail.Options = {
            entity: Email,
            listProperty: 'BusinessRelationInfo.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultEmail',
            storeIdInProperty: 'BusinessRelationInfo.DefaultEmailID',
            editor: (value) => new Promise((resolve) => {
                if (!value || !value.ID) {
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

        let multiValueAddress: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.InvoiceAddress');

        let addressModalSubscription;
        multiValueAddress.Options = {
            entity: Address,
            listProperty: 'BusinessRelationInfo.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.InvoiceAddress',
            storeIdInProperty: 'BusinessRelationInfo.InvoiceAddressID',
            editor: (value) => new Promise((resolve) => {
                if (!value || !value.ID) {
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

                let displayVal = (address.AddressLine1 ? address.AddressLine1 + ', ' : '')
                    + (address.PostalCode || '') + ' ' + (address.City || '')
                    + (address.CountryCode ? ', ' + address.CountryCode : '');
                return displayVal;
            }

        };
        let defaultBankAccount: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.DefaultBankAccount');
        defaultBankAccount.Options = {
            entity: BankAccount,
            listProperty: 'BusinessRelationInfo.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultBankAccount',
            storeIdInProperty: 'BusinessRelationInfo.DefaultBankAccountID',
            editor: (bankaccount: BankAccount) => new Promise((resolve) => {
                if (!bankaccount || !bankaccount.ID) {
                    bankaccount = new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = 'employee';
                    bankaccount.ID = 0;
                }

                this.bankAccountModal.confirm(bankaccount, false).then(res => {
                    resolve(res.model);
                }).catch(() => {
                    // nothing, just close the modal.
                });
            })
        };

        let employeeNameField: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.Name');
        employeeNameField.Hidden = this.employeeID === 0;

        let employeeSearchField: UniFieldLayout = this.findByProperty(fields, '_EmployeeSearchResult');
        employeeSearchField.Hidden = this.employeeID > 0;
        employeeSearchField.Options = {
            uniSearchConfig: this.getEmployeeLookupOptions()
        };

        let userIDField = this.findByProperty(fields, 'UserID');
        userIDField.Options = {
            getDefaultData: () => {
                return this.employee$
                    .take(1)
                    .switchMap(emp => {
                        return emp && emp.UserID
                            ? this.userService.Get(emp.UserID).map(u => [u])
                            : Observable.of([]);
                    })
            },
            template: (obj: User) => obj && obj.ID ? `${obj.DisplayName}` : '',
            search: (query) => this.userService
                .GetAll(`filter=contains(DisplayName, '${query}')&orderby=DisplayName&top=50`),
            displayProperty: 'DisplayName',
            valueProperty: 'ID',
            debounceTime: 200,
        };

        return this.showHideNameProperties(false, employee, fields);
    }

    private getEmployeeLookupOptions() {
        let uniSearchConfig = this.uniSearchConfigGeneratorService.generate(
            Employee,
            <[string]>this.expands,
            () => {
                let employee = this.employee$.getValue();
                let searchInfo = <any>this.uniform.field('_EmployeeSearchResult');
                if (searchInfo) {
                    if (searchInfo.component && searchInfo.component.input) {
                        employee.BusinessRelationInfo.Name = searchInfo.component.input.value;
                    }
                }

                if (!employee.BusinessRelationInfo.Name) {
                    employee.BusinessRelationInfo.Name = '';
                }

                this.employee$.next(employee);
                this.showHideNameProperties();
                return Observable.from([employee]);
            });

        uniSearchConfig.expandOrCreateFn = (newOrExistingItem: any) => {
            if (newOrExistingItem.ID) {
                // If an existing employee is selected, navigate to that employee instead
                // of populating the fields for a new employee
                this.router.navigateByUrl(`/salary/employees/${newOrExistingItem.ID}`);
                return Observable.empty();
            } else {
                let employeeData = this.uniSearchConfigGeneratorService
                    .employeeGenerator
                    .customStatisticsObjToEmployee(newOrExistingItem);

                return Observable.from([employeeData]);
            }
        };

        return uniSearchConfig;
    }

    private findByProperty(fields, name): UniFieldLayout {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private updateInfoFromSSN(employee: Employee) {
        if (employee.SocialSecurityNumber && employee.SocialSecurityNumber.length === 11) {

            let day: number = +employee.SocialSecurityNumber.substring(0, 2);
            let month: number = +employee.SocialSecurityNumber.substring(2, 4);
            let year: number = +employee.SocialSecurityNumber.substring(4, 6);
            let controlNumber: number = +employee.SocialSecurityNumber.substring(8, 9);

            let yearToday = +new Date().getFullYear().toString().substring(2, 4);

            if (year < yearToday) {
                let fullYear: string = new Date().getFullYear().toString().substring(0, 2) + (year < 10 ? '0' + year.toString() : year.toString());
                year = +fullYear;
            }

            if (year && month && day) {
                if (month > 0) {
                    month -= 1;
                }
                employee.BirthDate = new Date(year, month, day, 12);
            }

            employee.Sex = (controlNumber % 2) + 1;
        }
        return employee;

    }
}
