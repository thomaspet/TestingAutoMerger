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
                    EntityType: 'EmployeeTaxCard',
                    Property: 'TaxBtn',
                    FieldType: FieldType.BUTTON,
                    Label: 'Elektronisk skattekort',
                    FieldSet: 1,
                    Legend: 'Skatt',
                    Section: 0
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'Table',
                    FieldType: FieldType.TEXT,
                    Label: 'Hovedarbeidsgiver tabell',
                    FieldSet: 1,
                    Section: 0,
                    openByDefault: true,
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'Percent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Hovedarbeidsgiver prosent',
                    FieldSet: 1,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'SecondaryTable',
                    FieldType: FieldType.TEXT,
                    Label: 'Biarbeidsgiver tabell',
                    FieldSet: 1,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    },
                    openByDefault: true
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'SecondaryPercent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Biarbeidsgiver prosent',
                    FieldSet: 1,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: '_lastUpdated',
                    FieldType: FieldType.DATE_TIME_PICKER,
                    ReadOnly: true,
                    Label: 'Sist oppdatert',
                    FieldSet: 1,
                    Section: 0,
                    openByDefault: true,
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'NotMainEmployer',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Biarbeidsgiver',
                    FieldSet: 1,
                    Section: 0
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'NonTaxableAmount',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Fri inntekt',
                    FieldSet: 1,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'NumberOfDrawMonths',
                    FieldType: FieldType.NUMERIC,
                    ReadOnly: true,
                    Label: 'Antall måneder for trekk',
                    FieldSet: 1,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'PensionTable',
                    FieldType: FieldType.TEXT,
                    Label: 'Pensjon tabell',
                    FieldSet: 2,
                    Legend: 'Spesielle skattekort',
                    Section: 0,
                    openByDefault: true
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'PensionPercent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Pensjon prosent',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignCitizenInsuranceTable',
                    FieldType: FieldType.TEXT,
                    Label: 'Trygdeavgift utenlandsk borger tabell',
                    FieldSet: 2,
                    Section: 0,
                    openByDefault: true
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignCitizenInsurancePercent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Trygdeavgift utenlandsk borger prosent',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignBorderCommuterTable',
                    FieldType: FieldType.TEXT,
                    Label: 'Trygdeavgift utenlandsk borger grensegjenger tabell',
                    FieldSet: 2,
                    Section: 0,
                    openByDefault: true
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                },
                {
                    EntityType: 'EmployeeTaxCard',
                    Property: 'ForeignBorderCommuterPercent',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Trygdeavgift utenlandsk borger grensegjenger prosent',
                    FieldSet: 2,
                    Section: 0,
                    Options: {
                        format: 'Money',
                        decimalLength: 2
                    }
                    // Validations: [
                    //     {
                    //         ErrorMessage: 'Required field',
                    //         Level: 3,
                    //         Operator: 7 // required
                    //     }
                    // ]
                }]
        }]);
    }
}
