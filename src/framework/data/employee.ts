import {Injectable,Inject} from 'angular2/core';
import { Observable } from 'rxjs/Observable';
import {UniHttpService} from "./uniHttpService";

@Injectable()
export class EmployeeDS {
    expandedProperties = 'BusinessRelationInfo,Employments,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
    employees: Array<any> = [];
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
                    FieldType: 10, //TEXT
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Navn",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
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
                    FieldType: 10, //MASKED
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
                    FieldType: 2, //DATEPICKER
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
                    FieldType: 10, //DROPDOWN
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Kjønn",
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    IsLookUp: true,
                    LookUpValues: [
                        {
                            value:"1",
                            text:"Male"
                        },
                        {
                            value:"2",
                            text:"Male"
                        }
                    ],
                    Validations: [
                        {
                            ErrorMessage: "should be a valid value",
                            Operator: "SELECT",
                            values: ["male","female"],
                            Level:3
                        },
                        {
                            ErrorMessage: "Required field",
                            Level: 3,
                            Operator: "REQUIRED"
                        }
                    ]
                }
            ]
        });
    }
}