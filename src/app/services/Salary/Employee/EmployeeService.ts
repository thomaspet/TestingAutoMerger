import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, FieldType, Operator} from '../../../unientities';
import { Observable } from 'rxjs/Observable';

export class EmployeeService extends BizHttp<Employee> {
    
    public defaultExpand: any = [
        'BusinessRelationInfo.Addresses',
        'BusinessRelationInfo.Emails',
        'BusinessRelationInfo.Phones',
        'Employments.SubEntity.BusinessRelationInfo',
        'BankAccounts',
        'VacationRateEmployee',
        'SubEntity'
    ];
    public debounceTime = 500;
    public subEntities: Observable<any>;
    
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Employee.relativeUrl;
    }
    public getEmployeeCategories(employeenumber: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            // .withEndPoint('employeecategories')
            .withEndPoint(
                this.relativeURL 
                + '?action=get-employee-categories&EmployeeNumber=' 
                + employeenumber)
            .send();
            // .send({expand: '', filter: 'EmployeeNumber eq ' + id});
    }
    public get(id: number| string, expand: string[] = null) {    
        if (id === 0) {
            return this.GetNewEntity();
        }else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpand);
        }
    }

    public getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('subentities')
            .send({expand: 'BusinessRelationInfo'});
    }
    
    public getTotals(payrunID: number, employeeID: number = 0) {
        var params = '&payrun=' + payrunID;
        if (employeeID) {
            params += '&employee=' + employeeID;
        }
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({action: 'Sums' + params});
    }

    public getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('EmployeeLeave')
            .send();
    }
    
    public getNext(id: number) {
        return super.GetAction(id, 'next', 'expand:' + this.defaultExpand.join(','));
    }
    
    public getPrevious(id: number) {
        return super.GetAction(id, 'previous', 'expand:' + this.defaultExpand.join(','));
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
                    Legend: '',
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'SocialSecurityNumber',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.MASKED,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fødselsnummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    Validations: [
                        {
                            Value: '000000 00000',
                            ErrorMessage: 'Social Security Number should fit the pattern',
                            Operator: 'MASKED',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
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
                    Legend: '',
                    Validations: [
                        {
                            ErrorMessage: 'should be a valid date',
                            Operator: 'DATE',
                            Level: 3
                        },
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
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
                    Legend: '',
                    IsLookUp: true,
                    kendoOptions: {
                        dataSource: [{ID: 1, Name: 'Kvinne'}, {ID: 2, Name: 'Mann'}],
                        dataTextField: 'Name',
                        dataValueField: 'ID'
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
                    FieldType: FieldType.MASKED,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kontonummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    IsLookUp: false,
                    kendoOptions: {
                        mask: '0000 00 00000'
                    },
                    Validations: [
                        {
                            Value: '^/%d{11}/$',
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
                    Legend: '',
                    IsLookUp: false,
                    kendoOptions: {
                        dataSource: this.subEntities,
                        dataTextField: 'BusinessRelationInfo.Name',
                        dataValueField: 'ID'
                    },
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: '',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Overordnet',
                    Description: null,
                    HelpText: 'Ikke implementert enda',
                    FieldSet: 0,
                    Section: 0,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelationInfo',
                    Property: 'Addresses',
                    Placement: 2,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Adresse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: 'KONTAKTINFORMASJON',
                    IsLookUp: false,
                    openByDefault: true,
                    /*Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]*/
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.Addresses[0].PostalCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Postnummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.Addresses[0].City',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Poststed',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.Addresses[0].CountryCode',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Landkode',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.Addresses[0].Country',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Land',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelationInfo',
                    Property: 'Emails',
                    Placement: 6,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Epost',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    /*Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]*/
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'BusinessRelationInfo.Phones[0].LandCode',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Landkode',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelationInfo',
                    Property: 'Phones',
                    Placement: 8,
                    Hidden: false,
                    FieldType: 14,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Telefon',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: '',
                    IsLookUp: false,
                    /*Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]*/
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
                    Legend: 'SKATTEKORT',
                    IsLookUp: false,
                    openByDefault: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
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
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'NonTaxableAmount',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fri inntekt',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: '',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver',
                    Description: null,
                    HelpText: 'ikke implementert',
                    FieldSet: 0,
                    Section: 2,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'MunicipalityNumber',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kommunenummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Legend: '',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'InternationalID',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Nummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: 'INTERNASJONAL ID/BANK',
                    FieldsetLegend: 'Internasjonal ID',
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'InternationalIDType',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Type',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: null,
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'Employee',
                    Property: 'InternationalIDCountry',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utstedelsesland',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: null,
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
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
                    Label: 'IBAN/Kontonr.',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: 'Internasjonal bankkonto',
                    IsLookUp: false,
                    openByDefault: true,
                    Validations: [
                        {
                            ErrorMessage: 'Required field',
                            Level: 3,
                            Operator: 'REQUIRED'
                        }
                    ]
                }

                /* 
                 Add fields for
                 --------SPESIALINNSTILLINGER FOR DEN ANSATTE----
                 */
            ]
        }]);
    }

}
