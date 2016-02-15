import {Injectable,Inject} from 'angular2/core';
import { Observable } from 'rxjs/Observable';
import {UniHttpService} from "./uniHttpService";
import {UNI_CONTROL_TYPES} from '../../framework/controls/types';

@Injectable()
export class EmployeeDS {
    
    expandedProperties = 'BusinessRelationInfo.Addresses,BusinessRelationInfo.Emails,BusinessRelationInfo.Phones,Employments.Localization.BusinessRelationInfo,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
    //employees: Array<any> = [];
    
    constructor(
        @Inject(UniHttpService)
        public http:UniHttpService) {
    }
    
    get(id) {
        return this.http.get({
            resource: "employees/"+id,
            expand: this.expandedProperties
        });
    }

    layout(layoutID: string) {
        return Observable.of({
            Name: layoutID,
            BaseEntity: "Employee",
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "BusinessRelation",
                    Property: "BusinessRelationInfo.Name",
                    Placement: 1,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Navn",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "SocialSecurityNumber",
                    Placement: 2,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.MASKED,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fødselsnummer",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    Validations: [
                        {
                            Value:"000000 00000",
                            ErrorMessage: "Social Security Number should fit the pattern",
                            Operator: "MASKED",
                            Level:3
                        },
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BirthDate",
                    Placement: 3,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.DATEPICKER,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fødselsdato",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    Validations: [
                        {
                            ErrorMessage: "should be a valid date",
                            Operator: "DATE",
                            Level:3
                        },
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "Sex",
                    Placement: 4,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.COMBOBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kjønn",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: true,
                    kendoOptions: {
                        dataSource:  [{ID: 1, Navn: "Kvinne"}, {ID:2, Navn: "Mann"}],
                        dataTextField: 'Navn',
                        dataValueField: 'ID'
                    },
                    Validations: [
                        {
                            ErrorMessage: "should be a valid value",
                            Operator: "SELECT",
                            values: ["kvinne","mann"],
                            Level:3
                        },
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BankAccounts[0].AccountNumber",
                    Placement: 5,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.MASKED,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kontonummer",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            Value:"0000 00 00000",
                            ErrorMessage: "Accountnumber should fit the pattern",
                            Operator: "MASKED",
                            Level:3
                        },
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "MunicipalityNumber",
                    Placement: 6,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kommunenr",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "LocalizationID",
                    Placement: 7,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Lokasjon",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "",
                    Placement: 8,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Overordnet",
                    Description: null,
                    HelpText: "Ikke implementert enda",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Addresses[0].AddressLine1",
                    Placement: 1,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresse",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "KONTAKTINFORMASJON",
                    IsLookUp: false,
                    openByDefault: true,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Addresses[0].PostalCode",
                    Placement: 2,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Postnummer",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Addresses[0].City",
                    Placement: 3,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Poststed",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Addresses[0].CountryCode",
                    Placement: 4,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Landkode",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    IsLookUp: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Addresses[0].Country",
                    Placement: 5,
                    Hidden: false,
                    FieldType: UNI_CONTROL_TYPES.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Land",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    IsLookUp: false,
                    hasLineBreak: true,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
                
                /* 
                Add fields for
                ---------KONTAKTINFORMASJON------------
                - Epost
                - Retningsnummer (+47)
                - Telefon
                -----------SKATTEKORT--------------
                - Skattetabell
                - Skatteprosent
                - Fri inntekt
                - Biarbeidsgiver
                - Kommunenr
                ----------INTERNASJONAL ID/BANK--------
                --------SPESIALINNSTILLINGER FOR DEN ANSATTE----
                */ 
            ]
        });
    }
}