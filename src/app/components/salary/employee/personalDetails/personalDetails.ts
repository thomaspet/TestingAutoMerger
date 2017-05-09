import {Component, ViewChild, SimpleChanges} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UniForm } from 'uniform-ng2/main';
import {
    OperationType, Operator, ValidationLevel, Employee, Email, Phone,
    Address, Municipal, SubEntity, EmployeeTaxCard, BankAccount
} from '../../../../unientities';
import { AddressModal, EmailModal, PhoneModal } from '../../../common/modals/modals';
import { TaxCardModal } from '../modals/taxCardModal';
import { UniFieldLayout } from 'uniform-ng2/main';
import { UniView } from '../../../../../framework/core/uniView';
import { Observable } from 'rxjs/Observable';

import {
    EmployeeService,
    MunicipalService,
    EmployeeTaxCardService,
	BankAccountService,
	BusinessRelationService,
    ErrorService,
	UniCacheService,
    UniSearchConfigGeneratorService
} from '../../../../services/services';
declare var _;
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BankAccountModal } from '../../../common/modals/modals';



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
    public taxFields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private subEntities: SubEntity[];
    private employeeTaxCard$: BehaviorSubject<EmployeeTaxCard> = new BehaviorSubject(new EmployeeTaxCard());
    private employee$: BehaviorSubject<Employee> = new BehaviorSubject(new Employee());

    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(TaxCardModal) public taxCardModal: TaxCardModal;
    @ViewChild(PhoneModal) public phoneModal: PhoneModal;
    @ViewChild(EmailModal) public emailModal: EmailModal;
    @ViewChild(AddressModal) public addressModal: AddressModal;

    @ViewChild(BankAccountModal) public bankAccountModal: BankAccountModal;
    private employeeID: number;

    constructor(
        private employeeService: EmployeeService,
        private router: Router,
        private municipalService: MunicipalService,
        route: ActivatedRoute,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private employeeTaxCardService: EmployeeTaxCardService,
        private bankaccountService: BankAccountService,
        private businessRelationService: BusinessRelationService,
        private uniSearchConfigGeneratorService: UniSearchConfigGeneratorService
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
                .map(employee => {
                    this.toggleTaxButtonActive(employee);
                    return employee;
                })
                .subscribe(
                employee => {
                    this.employee$.next(employee);
                    this.showHideNameProperties(false);
                },
                err => this.errorService.handle(err)
                );

            super.getStateSubject('employeeTaxCard')
                .map((taxCard: EmployeeTaxCard) => {
                    taxCard['_lastUpdated'] = taxCard.UpdatedAt || taxCard.CreatedAt;
                    return taxCard;
                })
                .subscribe(
                taxCard => this.employeeTaxCard$.next(taxCard),
                err => this.errorService.handle(err)
                );

            if (!this.subEntities || this.fields$.getValue().length === 0) {
                super.getStateSubject('subEntities')
                    .take(1)
                    .subscribe((subEntity: SubEntity[]) => {
                        this.subEntities = subEntity;
                        this.getLayout();
                    }, err => this.errorService.handle(err));
            }

            if (!this.taxFields$.getValue().length) {
                Observable.combineLatest(
                    super.getStateSubject('taxCardModalCallback'),
                    super.getStateSubject('employee')
                )
                    .take(1)
                    .subscribe((response: [any, Employee]) => {
                        let [taxCardOptions, employee] = response;
                        this.getTaxLayout(taxCardOptions, employee);
                    });
            }
        });
    }

    private toggleTaxButtonActive(employee: Employee) {
        if (employee && this.taxFields$.getValue().length) {
            let taxFields = this.taxFields$.getValue();
            let field = this.findByProperty(taxFields, 'TaxBtn');
            field.ReadOnly = super.isDirty('employee') || !employee.SocialSecurityNumber;
            this.taxFields$.next(taxFields); // tried without this, didn't update when employee was updated
        }
    }

    private getTaxLayout(taxCardOptions: { openModal: () => void }, employee: Employee) {
        this.employeeTaxCardService.getLayout('EmployeeTaxCardForm').subscribe(layout => {
            let taxButton = this.findByProperty(layout.Fields, 'TaxBtn');
            taxButton.Options = {
                click: (event) => {
                    taxCardOptions.openModal();
                }
            };

            this.toggleTaxButtonActive(employee);

            let municipality = this.findByProperty(layout.Fields, 'MunicipalityNo');
            municipality.Options = {
                getDefaultData: () => this.employeeTaxCard$.getValue() && this.employeeTaxCard$.getValue().MunicipalityNo
                    ? this.municipalService
                        .GetAll(`filter=MunicipalityNo eq ${this.employeeTaxCard$.getValue().MunicipalityNo}`)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    : Observable.of([]),
                search: (query: string) => this.municipalService
                    .GetAll(`filter=
                        startswith(MunicipalityNo, '${query}')
                        or contains(MunicipalityName, '${query}')
                        &top=50`)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
                valueProperty: 'MunicipalityNo',
                displayProperty: 'MunicipalityNo',
                debounceTime: 200,
                template: (obj: Municipal) => obj
                    ? `${obj.MunicipalityNo} - ${obj.MunicipalityName.substr(0, 1).toUpperCase()
                    + obj.MunicipalityName.substr(1).toLowerCase()}`
                    : ''
            };
            this.taxFields$.next(layout.Fields);
        }, err => this.errorService.handle(err));
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
                this.fields$.next(layout.Fields);
                this.extendFormConfig();
            }
            , err => this.errorService.handle(err)
        );

    }

    public onFormReady(value) {
        // TODO: Cache focused field and reset to this?
        if (this.employeeID > 0) {
            this.uniform.field('BusinessRelationInfo.Name').then(f => f.focus());
        } else {
            this.uniform.field('_EmployeeSearchResult')
                .then(f => f.focus())
                .catch(() => {
                    this.uniform.field('BusinessRelationInfo.Name').then(f => f.focus());
                });
        }
    }

    public onFormChange(changes: SimpleChanges) {
        let employee = this.employee$.getValue();

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
                this.employee$.next(employee);

                this.showHideNameProperties(true);
            }
        }

        // if the user has typed something in Name for a new employee, but has not
        // selected something from the list or clicked F3, the searchbox is still active,
        // so we need to get the value from there
        if (!employee.ID || employee.ID === 0) {
            if (!employee.BusinessRelationInfo.Name || employee.BusinessRelationInfo.Name === '') {
                this.uniform.field('_EmployeeSearchResult').then(f => {
                    f.Component.then(c => {
                        employee.BusinessRelationInfo.Name = c.input.value;
                    });
                });
            }
        }
        setTimeout(() => {
            this.updateInfoFromSSN();
        });
        this.employee$.next(employee);
        super.updateState('employee', employee, true);
    }

    public onTaxFormChange(changes: SimpleChanges) {
        super.updateState('employeeTaxCard', this.employeeTaxCard$.getValue(), true);
    }

    public showHideNameProperties(doUpdateFocus: boolean = false) {
        let fields: UniFieldLayout[] = this.fields$.getValue();

        let employee = this.employee$.getValue();
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
                this.uniform.field('BusinessRelationInfo.Name').then(f => f.focus());
            }
        } else {
            if (employeeSearchResult) {
                employeeSearchResult.Hidden = false;
            }
            if (employeeName) {
                employeeName.Hidden = true;
            }

            if (doUpdateFocus) {
                this.uniform.field('_EmployeeSearchResult').then(f => f.focus());
            }
        }
    }

    private extendFormConfig() {
        let fields = this.fields$.getValue();
        const subEntityField = fields.find(field => field.Property === 'SubEntityID');
        subEntityField.Options.source = this.subEntities;

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

        this.showHideNameProperties(false);

        this.fields$.next(fields);
    }

    private getEmployeeLookupOptions() {
        let uniSearchConfig = this.uniSearchConfigGeneratorService.generate(
            Employee,
            <[string]>this.expands,
            () => {
                let employee = this.employee$.getValue();

                this.uniform.field('_EmployeeSearchResult').then(searchInfo => {
                    searchInfo.Component.then(c => {
                        employee.BusinessRelationInfo.Name = c.input.value;
                        if (!employee.BusinessRelationInfo.Name) {
                            employee.BusinessRelationInfo.Name = '';
                        }
                        this.employee$.next(employee);
                        this.showHideNameProperties();
                    });
                });

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

    private updateInfoFromSSN() {
        let employee = this.employee$.getValue();
        if (employee.SocialSecurityNumber && employee.SocialSecurityNumber.length === 11) {

            let day: number = +employee.SocialSecurityNumber.substring(0, 2);
            let month: number = +employee.SocialSecurityNumber.substring(2, 4);
            let year: number = +employee.SocialSecurityNumber.substring(4, 6);
            let controlNumbers: number = +employee.SocialSecurityNumber.substring(6, 9);

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

            employee.Sex = (controlNumbers % 2) + 1;
            this.employee$.next(employee);
            super.updateState('employee', employee, true);
        }

    }
}
