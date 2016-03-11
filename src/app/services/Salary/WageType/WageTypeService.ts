import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {WageType} from '../../../unientities';
import {TaxType} from "../../../unientities";
import {RateTypeColumn} from "../../../unientities";
import {LimitType} from "../../../unientities";
import {StdWageType} from "../../../unientities";
import {FieldType} from "../../../unientities";
import {Observable} from "rxjs/Observable";
import "rxjs/Rx";

let taxType: Array<any> = [
    {ID: TaxType.Tax_None, Name: "None"},
    {ID: TaxType.Tax_Table, Name: "TableTax"},
    {ID: TaxType.Tax_Percent, Name: "PercentTax"},
    {ID: TaxType.Tax_0, Name: "..."}
];

let rateType: Array<any> = [
    {ID: RateTypeColumn.none, Name: "None"},
    {ID: RateTypeColumn.Employment, Name: "Employment"},
    {ID: RateTypeColumn.Employee, Name: "Employee"},
    {ID: RateTypeColumn.Salary_scale, Name: "Salary Scale"}
];

let limitType: Array<any> = [
    {ID: LimitType.None, Name: "None"},
    {ID: LimitType.Amount, Name: "Amount"},
    {ID: LimitType.Sum, Name: "Sum"}
];

let stdWageType: Array<any> = [
    {ID: StdWageType.None, Name: "None"},
    {ID: StdWageType.TaxDrawTable, Name: "TableTax"},
    {ID: StdWageType.TaxDrawPercent, Name: "PercentTax"},
    {ID: StdWageType.HolidayPayWithTaxDeduction, Name: "Holidaypay with tax"},
    {ID: StdWageType.HolidayPayThisYear, Name: "Holidaypay this year"},
    {ID: StdWageType.HolidayPayLastYear, Name: "Holidaypay last year"},
];

let layout = {
    Name: "MockWagTypeLayout",
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
            LookupField: "Name",
            kendoOptions: {
                dataSource: [
                    {ID: StdWageType.None, Name: "None"},
                    {ID: StdWageType.TaxDrawTable, Name: "TableTax"},
                    {ID: StdWageType.TaxDrawPercent, Name: "PercentTax"},
                    {ID: StdWageType.HolidayPayWithTaxDeduction, Name: "Holidaypay with tax"},
                    {ID: StdWageType.HolidayPayThisYear, Name: "Holidaypay this year"},
                    {ID: StdWageType.HolidayPayLastYear, Name: "Holidaypay last year"}
                ],
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
        , {
            ComponentLayoutID: 1,
            EntityType: "wagetype",
            Property: "taxtype",
            Placement: 1,
            Hidden: false,
            FieldType: FieldType.COMBOBOX,
            ReadOnly: false,
            LookupField: "Name",
            Label: "Tax Type",
            Description: null,
            HelpText: null,
            FieldSet: 0,
            Section: 1,
            Legend: "",
            kendoOptions: {
                dataSource: [
                    {ID: TaxType.Tax_None, Name: "None"},
                    {ID: TaxType.Tax_Table, Name: "TableTax"},
                    {ID: TaxType.Tax_Percent, Name: "PercentTax"},
                    {ID: TaxType.Tax_0, Name: "..."}
                ],
                dataTextField: "Name",
                dataValueField: "ID"
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
        , {
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

}

export class WageTypeService extends BizHttp<WageType> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = WageType.relativeUrl;
    }

    getLocalizations() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('localizations')
            .send();
    }

    getTypes() {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint('wagetypes')
            .send();
    }

    //mocks layout request
    public GetLayout(ID: string) {
        return Observable.of(layout);
    }

    //mocked with layout request
    public GetLayoutAndEntity(LayoutID: string, EntityID: number) {
        var layout, self = this;
        return this.GetLayout(LayoutID)
            .concatMap((data: any) => {
                layout = data;
                return self.Get(EntityID, data.Expands);
            })
            .map((entity: any) => {
                return [layout, entity];
            });
    }
}