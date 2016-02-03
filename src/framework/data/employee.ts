import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/from';

@Injectable()
export class EmployeeDS {
    baseUrl = 'http://devapi.unieconomy.no:80/api';
    expandedProperties = 'BusinessRelationInfo,Employments,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization';
    employees: Array<any> = [];
    constructor(private http:Http) {
        
    }
    
    get(id) {
        if (!this.employees[id]) {
            var url = this.baseUrl + '/biz/employees/' + id + '?expand=' + this.expandedProperties;
            this.employees[id] = new ReplaySubject(1);

            return this._doGET(url)
                .subscribe(this.employees[id]);
        }
        return this.employees[id]
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
                    FieldType: 0, //TEXT
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
                    FieldType: 4, //MASKED
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
                    FieldType: 3, //DROPDOWN
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
    
    _doGET(url) {
        var headers = new Headers();
        headers.append('Client','client1');
        return this.http.get(url,{headers:headers})
        .map((res)=>res.json())
    }
}