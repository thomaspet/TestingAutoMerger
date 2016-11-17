import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, FieldType, Operator, SalaryTransaction, EmployeeCategory, SubEntity } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {ErrorService} from '../../common/ErrorService';

@Injectable()
export class EmployeeService extends BizHttp<Employee> {

    private employee: Subject<Employee> = new Subject<Employee>();

    public employee$: Observable<Employee> = this.employee.asObservable();

    private defaultExpands: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'BankAccounts'
    ];
    public debounceTime: number = 500;

    constructor(http: UniHttp, private errorService: ErrorService) {
        super(http);
        this.relativeURL = Employee.RelativeUrl;
        this.entityType = Employee.EntityType;
        this.defaultExpand = ['BusinessRelationInfo'];
    }

    public refreshEmployee(employee: Employee) {
        this.employee.next(employee);
    }

    public refreshEmployeeID(id: number) {
        this.Get(id, this.defaultExpands).subscribe((emp: Employee) => {
            this.employee.next(emp);
        }, this.errorService.handle);
    }

    public getEmployeeCategories(employeeID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
            this.relativeURL
            + '/'
            + employeeID
            + '/category')
            .send()
            .map(response => response.json());
        // .send({expand: '', filter: 'EmployeeNumber eq ' + id});
    }

    public saveEmployeeCategory(employeeID: number, category: EmployeeCategory) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(category)
            .withEndPoint(
            this.relativeURL
            + '/'
            + employeeID
            + '/category')
            .send()
            .map(response => response.json());
    }

    public deleteEmployeeCategory(employeeID: number, categoryID: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint(
            this.relativeURL
            + '/'
            + employeeID
            + '/category/'
            + categoryID)
            .send();
    }

    public get(id: number | string, expand: string[] = null) {
        if (id === 0) {
            if (expand) {
                return super.GetNewEntity(expand);
            }
            return super.GetNewEntity(this.defaultExpands);
        } else {
            if (expand) {
                return super.Get(id, expand);
            }
            return super.Get(id, this.defaultExpands);
        }
    }

    public getTotals(payrunID: number, employeeID: number = 0, localTranses: SalaryTransaction[] = []) {
        var params = '&payrun=' + payrunID;
        if (employeeID) {
            params += '&employee=' + employeeID;
        }

        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('salarytrans?action=Sums' + params)
            .withBody(localTranses)
            .send()
            .map(response => response.json()); //{action: 'Sums' + params});
    }

    public getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('EmployeeLeave')
            .send()
            .map(response => response.json());
    }

    public getNext(id: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=ID gt ${id}&top=1&orderBy=ID`, expands)
            .map(resultSet => resultSet[0]);
    }

    public getPrevious(id: number, expand: string[] = null) {
        let expands = expand || this.defaultExpands;
        return super.GetAll(`filter=ID lt ${id}&top=1&orderBy=ID desc`, expands)
            .map(resultSet => resultSet[0]);
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Employee',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Navn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',

                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'SocialSecurityNumber',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fødselsnummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        mask: '000000 00000'
                    },
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'BirthDate',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fødselsdato',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'Sex',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kjønn',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: true,
                    Options: {
                        source: [
                            { id: 1, name: 'Kvinne' },
                            { id: 2, name: 'Mann' }
                        ],
                        template: (obj) => `${obj.id} - ${obj.name}`,
                        valueProperty: 'id',
                        displayProperty: 'name'
                    },
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: Operator.Required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'BankAccounts[0].AccountNumber',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontonummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: {
                        mask: '0000 00 00000'
                    },
                    Validations: [
                        {
                            Value: '^\\d{11}$',
                            ErrorMessage: 'Accountnumber should fit the pattern',
                            Operator: Operator.RegExp,
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: Operator.Required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'SubEntityID',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Virksomhet',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Options: {
                        valueProperty: 'ID',
                        displayProperty: 'BusinessRelationInfo.Name',
                        debounceTime: 200
                    },
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: '',
                    Placement: 7,
                    Hidden: true,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Overordnet',
                    Description: null,
                    HelpText: 'Ikke implementert enda',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Adresse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til adresse',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'KONTAKTINFORMASJON',
                    IsLookUp: false,
                    openByDefault: true
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultEmail',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Epost',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til e-post',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.DefaultPhone',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.MULTIVALUE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Telefon',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: 'Legg til telefon',
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'TaxBtn',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.COMBOBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Elektronisk skattekort',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'SKATTEKORT',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'TaxTable',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skattetabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    IsLookUp: false,
                    openByDefault: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'TaxPercentage',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skatteprosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'NonTaxableAmount',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fri inntekt',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'NotMainEmployer',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.MULTISELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: []
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'Employee',
                    Property: 'MunicipalityNo',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kommune',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 7 // required
                        }
                    ]
                }
                // ,{
                //     ComponentLayoutID: 1,

                //     EntityType: 'Employee',
                //     Property: 'InternationalID',
                //     Placement: 1,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Nummer',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Legend: 'Internasjonal ID/Bank',
                //     Sectionheader: 'INTERNASJONAL',
                //     IsLookUp: false,
                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'InternasjonalIDType',
                //     Placement: 2,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Type',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Sectionheader: null,
                //     Legend: null,
                //     IsLookUp: false,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'InternasjonalIDCountry',
                //     Placement: 3,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'Utstedelsesland',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 1,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Sectionheader: null,
                //     Legend: null,
                //     IsLookUp: false,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // },
                // {
                //     ComponentLayoutID: 1,
                //     EntityType: 'Employee',
                //     Property: 'TaxTable',
                //     Placement: 1,
                //     Hidden: false,
                //     FieldType: FieldType.TEXT,
                //     ReadOnly: false,
                //     LookupField: false,
                //     Label: 'IBAN/Kontonr.',
                //     Description: null,
                //     HelpText: null,
                //     FieldSet: 2,
                //     Section: 3,
                //     Placeholder: null,
                //     Options: null,
                //     LineBreak: null,
                //     Combo: null,
                //     Sectionheader: null,
                //     Legend: 'Internasjonal bankkonto',
                //     IsLookUp: false,
                //     openByDefault: true,

                //     Validations: [
                //         {
                //             ErrorMessage: 'Required field',
                //             Level: 3,
                //             Operator: 7 // required
                //         }
                //     ]
                // }

                /*
                 Add fields for
                 --------SPESIALINNSTILLINGER FOR DEN ANSATTE----
                 */
            ]
        }]);
    }

}
