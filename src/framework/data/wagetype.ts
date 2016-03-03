import {Injectable, Inject} from "angular2/core";
import {UniHttp} from "./../core/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromArray";

//import {UNI_CONTROL_TYPES} from "../../framework/controls/types";
import {FieldType} from "../../framework/interfaces/interfaces";
import {IWageType, StdWageType, LimitType, TaxType, RateTypeColumn} from "../../framework/interfaces/interfaces";

@Injectable()
export class WagetypeService {

    //expandedproperties = [];
    
    constructor(@Inject(UniHttp)
                public http: UniHttp) {
    }


    get(id: number|string) {        
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("wagetypes/" + id)
            .send();
    }
    
    getLocalizations() {
                return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("localizations")
            .send();
    }

    getTypes() {        
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint("wagetypes/")
            .send();
    }
    
    update(entity)
    {
        return this.http
        .usingBusinessDomain()
        .asPUT()
        .withEndPoint("wagetypes/")
        .send(JSON.stringify(entity));
        
    }
    
    taxType : Array<any> = [
        {ID: TaxType.Tax_None, Name:"None" },        
        {ID: TaxType.Tax_Table, Name:"TableTax" },
        {ID: TaxType.Tax_Percent, Name:"PercentTax" },
        {ID: TaxType.Tax_0, Name:"..." }
    ];    
    
    rateType : Array<any> = [
        {ID: RateTypeColumn.none, Name:"None" },        
        {ID: RateTypeColumn.Employment, Name:"Employment" },
        {ID: RateTypeColumn.Employee, Name:"Employee" },
        {ID: RateTypeColumn.Salary_scale, Name:"Salary Scale" }
    ];    
    
    limitType : Array<any> = [
        {ID: LimitType.None, Name:"None" },        
        {ID: LimitType.Amount, Name:"Amount" },
        {ID: LimitType.Sum, Name:"Sum" }
    ];    
    
    stdWageType : Array<any> = [
        {ID: StdWageType.None, Name:"None" },
        {ID: StdWageType.TaxDrawTable, Name:"TableTax" },
        {ID: StdWageType.TaxDrawPercent, Name:"PercentTax" },
        {ID: StdWageType.HolidayPayWithTaxDeduction, Name:"Holidaypay with tax" },
        {ID: StdWageType.HolidayPayThisYear, Name:"Holidaypay this year" },
        {ID: StdWageType.HolidayPayLastYear, Name:"Holidaypay last year" },
    ];
    
    
    layout(layoutID: string) {
        return Observable.fromArray([{
            Name: layoutID,
            BaseEntity: "wagetype",
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "wagetype",
                    Property: "WageTypeId",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: "Wagetype ID",                    
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
                    EntityType: "wagetype",
                    Property: "WageTypeName",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Wagetype Name",
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
                    EntityType: "wagetype",
                    Property: "Description",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Description",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    hasLineBreak: false                    
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "wagetype",
                    Property: "Base_EmploymentTax",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Employment Tax",
                    Description: null,
                    HelpText: null,
                    openByDefault: true,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "SETTINGS",
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
                    EntityType: "wagetype",
                    Property: "Base_Payment",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Is Payment",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,  
                    Legend: "SETTINGS",
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
                ,                 
                {
                    ComponentLayoutID: 1,
                    EntityType: "wagetype",
                    Property: "HideFromPaycheck",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Hide from paycheck",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: "wagetype",
                    Property: "Base_Vacation",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Holiday",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
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
                    EntityType: "wagetype",
                    Property: "StandardWageTypeFor",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.COMBOBOX,
                    ReadOnly: false,
                    //LookupField: false,
                    LookupField : "Name",                    
                    kendoOptions: {
                        dataSource: this.stdWageType,
                        dataTextField: "Name",
                        dataValueField: "ID"
                    },
                    /*
                    fromArray: [
        {ID: 0, Name:"None" },
        {ID: 1, Name:"TableTax" },
        {ID: 2, Name:"PercentTax" },
        {ID: 3, Name:"Holidaypay with tax" },
        {ID: 4, Name:"Holidaypay this year" },
        {ID: 5, Name:"Holidaypay last year" },
    ],*/
                    Label: "Standard Wagetype for",
                    Description: null,                    
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
                ,{
                    ComponentLayoutID: 1,
                    EntityType: "wagetype",
                    Property: "TaxType",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.COMBOBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Tax Type",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,                    
                    Legend: "",
                    kendoOptions:{
                      dataSource: this.taxType,
                      dataTextField: "Name",
                      data: "ID"   
                    },
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
                ,{
                    ComponentLayoutID: 1,
                    EntityType: "wagetype",
                    Property: "AccountNumber",
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Account Number",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Legend: "",
                    hasLineBreak: false,
                    Validations: [
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
                
            ]
            
        }]);
    }
}