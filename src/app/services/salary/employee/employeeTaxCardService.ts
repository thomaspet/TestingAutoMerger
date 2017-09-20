import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeTaxCard} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType} from '../../../../framework/ui/uniform/index';

@Injectable()
export class EmployeeTaxCardService extends BizHttp<EmployeeTaxCard> {
    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeTaxCard.RelativeUrl;
        this.entityType = EmployeeTaxCard.EntityType;
    }

    public GetTaxCard(employeeID: number, activeYear: number): Observable<EmployeeTaxCard> {
        return this.GetAll(
            'filter=EmployeeID eq ' + employeeID
            + ' and Year le ' + activeYear
            + '&orderby=Year DESC'
            + '&top=1')
            .map(response => response[0]);
    }

    public getLayout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'EmployeeTaxCard',
            Fields: [
                {
                    ComponentLayoutID: 1,

                    EntityType: 'EmployeeTaxCard',
                    Property: 'TaxBtn',
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.BUTTON,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Elektronisk skattekort',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Legend: 'Skatt',
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: null,
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'EmployeeTaxCard',
                    Property: 'Table',
                    Placement: 2,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedarbeidsgiver tabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'Percent',
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Hovedarbeidsgiver prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'SecondaryTable',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver tabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'SecondaryPercent',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: '_lastUpdated',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.DATE_TIME_PICKER,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Sist oppdatert',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    IsLookUp: false,
                    openByDefault: true,
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'EmployeeTaxCard',
                    Property: 'NotMainEmployer',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'NonTaxableAmount',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fri inntekt',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'NumberOfDrawMonths',
                    Placement: 8,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Antall måneder for trekk',
                    Description: null,
                    HelpText: null,
                    FieldSet: 1,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'PensionTable',
                    Placement: 9,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Pensjon tabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Legend: 'Spesielle skattekort',
                    Section: 0,
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'PensionPercent',
                    Placement: 10,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Pensjon prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignCitizenInsuranceTable',
                    Placement: 11,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trygdeavgift utenlandsk borger tabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignCitizenInsurancePercent',
                    Placement: 12,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trygdeavgift utenlandsk borger prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignBorderCommuterTable',
                    Placement: 11,
                    Hidden: false,
                    FieldType: FieldType.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trygdeavgift utenlandsk borger grensegjenger tabell',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
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

                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignBorderCommuterPercent',
                    Placement: 12,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Trygdeavgift utenlandsk borger grensegjenger prosent',
                    Description: null,
                    HelpText: null,
                    FieldSet: 2,
                    Section: 0,
                    Placeholder: null,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
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
                }]
        }]);
    }
}
