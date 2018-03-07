import {Component, ViewChild, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniForm, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {UniView} from '../../../../../framework/core/uniView';
import {
    Employee, Email, Phone,
    Address, SubEntity, BankAccount, User
} from '../../../../unientities';
import {
    UniModalService,
    UniAddressModal,
    UniEmailModal,
    UniPhoneModal,
    UniBankAccountModal
} from '../../../../../framework/uniModal/barrel';
import {
    EmployeeService,
    MunicipalService,
    BankAccountService,
    BusinessRelationService,
    ErrorService,
    UniCacheService,
    UniSearchEmployeeConfig,
    UserService
} from '../../../../services/services';
declare const _;

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniField} from '../../../../../framework/ui/uniform/index';

const EMPLOYEE_KEY = 'employee';

@Component({
    selector: 'employee-personal-details',
    templateUrl: './personalDetails.html'
})
export class PersonalDetails extends UniView {
    @ViewChild(UniForm)
    public uniform: UniForm;

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

    private employeeID: number;
    public collapseTax: boolean;

    constructor(
        private employeeService: EmployeeService,
        private router: Router,
        private municipalService: MunicipalService,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private bankaccountService: BankAccountService,
        private businessRelationService: BusinessRelationService,
        private uniSearchEmployeeConfig: UniSearchEmployeeConfig,
        private userService: UserService,
        private modalService: UniModalService
    ) {

        super(router.url, cacheService);

        this.config$.next({
            submitText: '',
            sections: {
                1: {isOpen: true},
                2: {isOpen: true}
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
            super.getStateSubject(EMPLOYEE_KEY)
                .subscribe(
                employee => {
                    this.employee$.next(employee);
                    this.showHideNameProperties(false, employee);
                },
                err => this.errorService.handle(err)
                );

            Observable
                .combineLatest(
                super.getStateSubject(EMPLOYEE_KEY),
                super.getStateSubject('subEntities'))
                .take(1)
                .subscribe((result: [Employee, SubEntity[]]) => {
                    let [employee, subEntities] = result;
                    this.getLayout(subEntities, employee);
                });
        });
    }

    private getLayout(subEntities: SubEntity[], employee: Employee) {
        this.employeeService.layout('EmployeePersonalDetailsForm', employee).subscribe(
            (layout: any) => {
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
            .asObservable()
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => {
                    const change = changes[key];
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
                    const searchResult = changes['_EmployeeSearchResult'].currentValue;
                    if (searchResult) {
                        employee = searchResult;
                        this.showHideNameProperties(true, employee);
                    }
                }

                if (changes['SocialSecurityNumber']) {
                    this.updateInfoFromSSN(employee);
                }

                return employee;
            })
            .subscribe(employee => super.updateState(EMPLOYEE_KEY, employee, true));
    }

    public showHideNameProperties(
        doUpdateFocus: boolean = false, employee?: Employee, fields?: any[]
    ) {
        let refresh = !fields;
        fields = fields || this.fields$.getValue();
        employee = employee || this.employee$.getValue();

        let employeeSearchResult: UniFieldLayout = fields.find(x => x.Property === '_EmployeeSearchResult');
        let employeeName: UniFieldLayout = fields.find(x => x.Property === 'BusinessRelationInfo.Name');

        if (this.employeeID > 0
            || (employee && employee.BusinessRelationInfo
                && employee.BusinessRelationInfo.Name !== null
                && employee.BusinessRelationInfo.Name !== '')
        ) {
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
        };

        let multiValuePhone: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.DefaultPhone');
        multiValuePhone.Options = {
            entity: Phone,
            listProperty: 'BusinessRelationInfo.Phones',
            displayValue: 'Number',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultPhone',
            storeIdInProperty: 'BusinessRelationInfo.DefaultPhoneID',
            editor: (value) => {
                const modal = this.modalService.open(UniPhoneModal, {
                    data: value || new Phone()
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (phone: Phone) => {
                let displayVal = '';
                if (phone.Number) {
                    displayVal = (phone.CountryCode && phone.Number.substr(0, 3) !== phone.CountryCode
                        ? phone.CountryCode + ' ' : '') + phone.Number;
                }
                return displayVal;
            }
        };

        let multiValueEmail: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.DefaultEmail');
        multiValueEmail.Options = {
            entity: Email,
            listProperty: 'BusinessRelationInfo.Emails',
            displayValue: 'EmailAddress',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultEmail',
            storeIdInProperty: 'BusinessRelationInfo.DefaultEmailID',
            editor: (value) => {
                const modal = this.modalService.open(UniEmailModal, {
                    data: value || new Email()
                });

                return modal.onClose.take(1).toPromise();
            }
        };

        let multiValueAddress: UniFieldLayout = this.findByProperty(fields, 'BusinessRelationInfo.InvoiceAddress');

        multiValueAddress.Options = {
            entity: Address,
            listProperty: 'BusinessRelationInfo.Addresses',
            displayValue: 'AddressLine1',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.InvoiceAddress',
            storeIdInProperty: 'BusinessRelationInfo.InvoiceAddressID',
            editor: (value) => {
                const modal = this.modalService.open(UniAddressModal, {
                    data: value || new Address()
                });

                return modal.onClose.take(1).toPromise();
            },
            display: (address: Address) => {

                let displayVal = (address.AddressLine1 ? address.AddressLine1 + ', ' : '')
                    + (address.PostalCode || '') + ' ' + (address.City || '')
                    + (address.CountryCode ? ', ' + address.CountryCode : '');
                return displayVal;
            }

        };
        let defaultBankAccount: UniFieldLayout;
        defaultBankAccount = this.findByProperty(fields, 'BusinessRelationInfo.DefaultBankAccount');
        defaultBankAccount.Options = {
            entity: BankAccount,
            listProperty: 'BusinessRelationInfo.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: 'BusinessRelationInfo.DefaultBankAccount',
            storeIdInProperty: 'BusinessRelationInfo.DefaultBankAccountID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount) {
                    bankaccount = new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = 'employee';
                    bankaccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            }
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
                    .asObservable()
                    .take(1)
                    .switchMap(emp => {
                        return emp && emp.UserID
                            ? this.userService.Get(emp.UserID).map(u => [u])
                            : Observable.of([]);
                    });
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
        let uniSearchConfig = this.uniSearchEmployeeConfig.generate(
            this.expands,
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
                this.showHideNameProperties(true, employee);
                return Observable.from([employee]);
            });

        uniSearchConfig.unfinishedValueFn = (val) => {
            return this.employee$
                .asObservable()
                .take(1)
                .map((emp: Employee) => {
                    emp.BusinessRelationInfo.Name = val.toString();
                    return emp;
                });
        };

        uniSearchConfig.onSelect = (selectedItem: any) => {
            if (selectedItem.ID) {
                // If an existing employee is selected, navigate to that employee instead
                // of populating the fields for a new employee
                this.router.navigateByUrl(`/salary/employees/${selectedItem.ID}`);
                return Observable.empty();
            } else {
                let employeeData = this.uniSearchEmployeeConfig
                    .customStatisticsObjToEmployee(selectedItem);

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
                let fullYear: string = new Date().getFullYear().toString().substring(0, 2)
                    + (year < 10 ? '0' + year.toString() : year.toString());
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
