import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {WageType} from '../../../unientities';
import {TaxType} from '../../../unientities';
// import {RateTypeColumn} from '../../../unientities';
// import {LimitType} from '../../../unientities';
import {StdWageType} from '../../../unientities';
import {FieldType} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

let taxType: Array<any> = [
    {ID: TaxType.Tax_None, Name: 'Ingen'},
    {ID: TaxType.Tax_Table, Name: 'Tabelltrekk'},
    {ID: TaxType.Tax_Percent, Name: 'Prosenttrekk'},
    {ID: TaxType.Tax_0, Name: '...'}
];

// let rateType: Array<any> = [
//     {ID: RateTypeColumn.none, Name: 'Ingen'},
//     {ID: RateTypeColumn.Employment, Name: 'Arbeidsforhold'},
//     {ID: RateTypeColumn.Employee, Name: 'Ansatt'},
//     {ID: RateTypeColumn.Salary_scale, Name: 'Regulativ'}
// ];

// let limitType: Array<any> = [
//     {ID: LimitType.None, Name: 'Ingen'},
//     {ID: LimitType.Amount, Name: 'Antall'},
//     {ID: LimitType.Sum, Name: 'Sum'}
// ];

let stdWageType: Array<any> = [
    {ID: StdWageType.None, Name: 'Ingen'},
    {ID: StdWageType.TaxDrawTable, Name: 'Tabelltrekk'},
    {ID: StdWageType.TaxDrawPercent, Name: 'Prosenttrekk'},
    {ID: StdWageType.HolidayPayWithTaxDeduction, Name: 'Feriepenger med skattetrekk'},
    {ID: StdWageType.HolidayPayThisYear, Name: 'Feriepenger i år'},
    {ID: StdWageType.HolidayPayLastYear, Name: 'Feriepenger forrige år'},
];



export class WageTypeService extends BizHttp<WageType> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = WageType.RelativeUrl;
    }

    public getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('subentities')
            .send();
    }

    public getTypes() {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint('wagetypes')
            .send();
    }
    
    public getWageType(id): Observable<any> {
        if (id === 0) {
            return this.GetNewEntity();
        } else {
            return this.Get(id);
        }
    }
    
    public getPrevious(ID: number) {
        return super.GetAction(ID, 'previous');
    }
    
    public getNext(ID: number) {
        return super.GetAction(ID, 'next');
    }
    
    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'wagetype',
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'WageTypeId',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Nummer',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'WageTypeName',
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
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Description',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beskrivelse',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_EmploymentTax',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skatt (tabell)',
                    Description: null,
                    HelpText: null,
                    openByDefault: true,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: 'Med i grunnlag for',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_Payment',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Utbetaling',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                }
                ,
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'HideFromPaycheck',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Skjul på lønnslipp',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'Base_Vacation',
                    Placement: 1,
                    Hidden: false,
                    FieldType: 5,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Feriepenger',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'StandardWageTypeFor',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: 'Name',
                    Options: {
                        source: stdWageType,
                        displayProperty: 'Name',
                        valueProperty: 'ID'
                    },
                    Label: 'Standard lønnsart for',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                }
                , {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'taxtype',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: 'Name',
                    Label: 'Type',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    Options: {
                        source: taxType,
                        displayProperty: 'Name',
                        valueProperty: 'ID'
                    },
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                }
                , {
                    ComponentLayoutID: 1,
                    EntityType: 'wagetype',
                    Property: 'AccountNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedbokskonto',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 1,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    hasLineBreak: false,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 'REQUIRED'
                    //     }
                    // ]
                }

            ]
        }]);
    };
    
    // // mocks layout request
    // public getLayout(ID: string) {
    //     return Observable.of(layout(ID));
    // }

    // // mocked with layout request
    // public getLayoutAndEntity(layoutID: string, entityID: number) {
    //     var layout, self = this;
    //     return this.GetLayout(layoutID)
    //         .concatMap((data: any) => {
    //             layout = data;
    //             return self.Get(entityID, data.Expands);
    //         })
    //         .map((entity: any) => {
    //             return [layout, entity];
    //         });
    // }
}
