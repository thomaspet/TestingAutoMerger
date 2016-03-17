import {Injectable, Inject} from "angular2/core";
import { Observable } from "rxjs/Observable";
import {UniHttp} from "../../framework/core/http/http";
import {FieldType} from "../unientities";
import "rxjs/add/observable/fromArray";

@Injectable()
export class EmployeeDS {

    expandedProperties = [
        "BusinessRelationInfo.Addresses",
        "BusinessRelationInfo.Emails",
        "BusinessRelationInfo.Phones",
        "Employments.SubEntity.BusinessRelationInfo",
        "BankAccounts",
        "VacationRateEmployee",
        "SubEntity"
    ].join(",");
        
    subEntities: Observable<any>;

    constructor(@Inject(UniHttp)
                public http: UniHttp) {
    }

    get(id: number|string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("employees/" + id)
            .send({expand: this.expandedProperties});
    }

    getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("subentities")
            .send({expand: "BusinessRelationInfo"});
    }
    
    getTotals(ansattID:number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("salarytrans")
            .send({filter: "EmployeeNumber eq " + ansattID});
    }

    getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("EmployeeLeave")
            .send();
    }

    layout(layoutID: string) {
        return Observable.fromArray([{
            Name: layoutID,
            BaseEntity: "Employee",
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "BusinessRelation",
                    Property: "BusinessRelationInfo.Name",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.MASKED,
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
                            Value: "000000 00000",
                            ErrorMessage: "Social Security Number should fit the pattern",
                            Operator: "MASKED",
                            Level: 3
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
                    FieldType: FieldType.DATEPICKER,
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
                            Level: 3
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
                    FieldType: FieldType.COMBOBOX,
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
                        dataSource: [{ID: 1, Navn: "Kvinne"}, {ID: 2, Navn: "Mann"}],
                        dataTextField: "Navn",
                        dataValueField: "ID"
                    },
                    Validations: [
                        {
                            ErrorMessage: "should be a valid value",
                            Operator: "SELECT",
                            values: ["kvinne", "mann"],
                            Level: 3
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
                    FieldType: FieldType.MASKED,
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
                            Value: "0000 00 00000",
                            ErrorMessage: "Accountnumber should fit the pattern",
                            Operator: "MASKED",
                            Level: 3
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
                    Property: "SubEntityID",
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.COMBOBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Lokasjon",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: false,
                    kendoOptions: {
                        dataSource: this.subEntities,
                        dataTextField: "BusinessRelationInfo.Name",
                        dataValueField: "ID"
                    },
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
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
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
                    FieldType: FieldType.TEXT,
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
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Employee",
                    Property: "BusinessRelationInfo.Emails[0].EmailAddress",
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Epost",
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
                    Property: "BusinessRelationInfo.Phones[0].LandCode",
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
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
                    Property: "BusinessRelationInfo.Phones[0].Number",
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Telefon",
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
                    Property: "TaxTable",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Skattetabell",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Legend: "SKATTEKORT",
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
                    Property: "TaxPercentage",
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Skatteprosent",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
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
                    Property: "NonTaxableAmount",
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Fri inntekt",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
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
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Biarbeidsgiver",
                    Description: null,
                    HelpText: "ikke implementert",
                    FieldSet: 0,
                    Section: 2,
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
                    Property: "MunicipalityNumber",
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kommunenr",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
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
                    Property: "InternationalID",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Nummer",
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: "INTERNASJONAL ID/BANK",
                    FieldsetLegend: "Internasjonal ID",
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
                    Property: "InternationalIDType",
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Type",
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: null,
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
                    Property: "InternationalIDCountry",
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Utstedelsesland",
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: null,
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
                    Property: "TaxTable",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "IBAN / Kontonr.",
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 3,
                    Legend: null,
                    FieldsetLegend: "Internasjonal bankkonto",
                    IsLookUp: false,
                    openByDefault: true,
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
                 --------SPESIALINNSTILLINGER FOR DEN ANSATTE----
                 */
            ]
        }]);
    }
}
