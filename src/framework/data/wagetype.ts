import {Injectable, Inject} from "angular2/core";
import {UniHttp} from "./../core/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromArray";

//import {UNI_CONTROL_TYPES} from "../../framework/controls/types";
import {FieldType} from "../../framework/interfaces/interfaces";

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
                },                 
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
                    LookupField: false,
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
                    Property: "StandardWageTypeFor",
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