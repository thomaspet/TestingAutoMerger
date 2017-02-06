import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { EmployeeTaxCard} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import {FieldType} from 'uniform-ng2/main';

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
                    Placement: 3,
                    Hidden: false,
                    FieldType: FieldType.BUTTON,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Elektronisk skattekort',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Sectionheader: 'SKATTEKORT',
                    IsLookUp: false
                },
                {
                    ComponentLayoutID: 1,

                    EntityType: 'EmployeeTaxCard',
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
                    Placeholder: null,
                    Options: null,
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
                    Property: 'NonTaxableAmount',
                    Placement: 5,
                    Hidden: false,
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Fri inntekt',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
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
                    Property: 'NotMainEmployer',
                    Placement: 6,
                    Hidden: false,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Biarbeidsgiver',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
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
                    Property: 'MunicipalityNo',
                    Placement: 7,
                    Hidden: false,
                    FieldType: FieldType.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kommune',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
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
                    Placement: 1,
                    Hidden: false,
                    FieldType: FieldType.DATE_TIME_PICKER,
                    ReadOnly: true,
                    LookupField: false,
                    Label: 'Sist oppdatert',
                    Description: null,
                    HelpText: null,
                    FieldSet: 0,
                    Section: 2,
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    IsLookUp: false,
                    openByDefault: true,
                }]
        }]);
    }
}
