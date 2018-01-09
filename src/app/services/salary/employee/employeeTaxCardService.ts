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

    public GetEmployeeTaxCard(employeeID: number, activeYear: number): Observable<EmployeeTaxCard> {
        return this.GetAll(
            'filter=EmployeeID eq ' + employeeID
            + ' and Year le ' + activeYear
            + '&orderby=Year DESC'
            + '&top=1'
            + '&expand=loennFraHovedarbeidsgiver,loennFraBiarbeidsgiver,pensjon,loennTilUtenrikstjenestemann'
            + ',loennKunTrygdeavgiftTilUtenlandskBorger,loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger')
            .map(response => response[0]);
    }

    public hasTaxCard(taxcard: EmployeeTaxCard, year: number): boolean {
        return taxcard && !!(taxcard.loennFraBiarbeidsgiver ||
            taxcard.loennFraHovedarbeidsgiver ||
            taxcard.loennKunTrygdeavgiftTilUtenlandskBorger ||
            taxcard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger ||
            taxcard.loennTilUtenrikstjenestemann ||
            taxcard.pensjon) && taxcard.Year === year;
    }

    public getLayout(layoutID: string, employeeTaxcard: EmployeeTaxCard) {
        if (employeeTaxcard.Year > 2017) {
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
                        Property: 'loennFraHovedarbeidsgiver.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Hovedarbeidsgiver tabell',
                        FieldSet: 1,
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraHovedarbeidsgiver.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Hovedarbeidsgiver prosent',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Biarbeidsgiver tabell',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        },
                        openByDefault: true,
                        Hidden: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Biarbeidsgiver prosent',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
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
                        Property: 'ikkeTrekkPlikt',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Ikke trekkpliktig',
                        FieldSet: 1,
                        Section: 0,
                        ReadOnly: true
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
                        Property: 'loennFraHovedarbeidsgiver.freeAmountType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Frikort type (hoved)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            source: [
                                { id: 0, name: 'Ingen' },
                                { id: 1, name: 'Frikort med beløp' },
                                { id: 3, name: 'Frikort uten beløp' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'id',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.freeAmountType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Frikort type (pensjon)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            source: [
                                { id: 0, name: 'Ingen' },
                                { id: 1, name: 'Frikort med beløp' },
                                { id: 3, name: 'Frikort uten beløp' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'id',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'NonTaxableAmount',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Frikortbeløp',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraHovedarbeidsgiver.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        Label: 'Måneder trekk (hoved)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        Label: 'Måneder trekk (bi)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        Label: 'Måneder trekk (pensjon)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorger.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        Label: 'Måneder trekk (utl)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        Label: 'Måneder trekk (grense)',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Pensjon tabell',
                        FieldSet: 2,
                        Legend: 'Spesielle skattekort',
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Pensjon prosent',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorger.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Trygdeavgift utenlandsk borger tabell',
                        FieldSet: 2,
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorger.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Trygdeavgift utenlandsk borger prosent',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Trygdeavgift utenlandsk borger grensegjenger tabell',
                        FieldSet: 2,
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Trygdeavgift utenlandsk borger grensegjenger prosent',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'ResultatStatus',
                        FieldType: FieldType.TEXT,
                        Label: 'Resultat status',
                        FieldSet: 2,
                        Section: 0,
                        ReadOnly: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'Tilleggsopplysning',
                        FieldType: FieldType.TEXT,
                        Label: 'Tilleggsopplysning status',
                        FieldSet: 2,
                        Section: 0,
                        ReadOnly: true
                    }]
            }]);
        } else {
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
                        openByDefault: true
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
                        openByDefault: true,
                        Hidden: true
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
                        Property: 'ikkeTrekkPlikt',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Ikke trekkpliktig',
                        FieldSet: 1,
                        Section: 0,
                        Hidden: true
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
                        Label: 'Frikortbeløp',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    }]
            }]);
        }
    }
}
