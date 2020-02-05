import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeTaxCard, TaxCard, FreeAmountType} from '../../../unientities';
import {Observable} from 'rxjs';
import {FieldType} from '../../../../framework/ui/uniform/index';
import { map } from 'rxjs/operators';

const EMPLOYEE_TAX_KEY = 'employeeTaxCard';

@Injectable()
export class EmployeeTaxCardService extends BizHttp<EmployeeTaxCard> {
    private freeAmountTypes = [
        { id: FreeAmountType.None, name: 'Ingen' },
        { id: FreeAmountType.WithAmount, name: 'Frikort med beløp' },
        { id: FreeAmountType.NoLimit, name: 'Frikort uten beløp' }
    ];
    constructor(protected http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeTaxCard.RelativeUrl;
        this.entityType = EmployeeTaxCard.EntityType;
    }

    public expandOptionsNewTaxcardEntity: Array<string> = [
        'loennFraHovedarbeidsgiver',
        'loennFraBiarbeidsgiver',
        'pensjon',
        'loennTilUtenrikstjenestemann',
        'loennKunTrygdeavgiftTilUtenlandskBorger',
        'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger',
        'ufoereYtelserAndre'
    ];

    public getNameFromFreeAmountType(freeAmountType: FreeAmountType) {
        const type = this.freeAmountTypes.find(t => t.id === freeAmountType);
        return type && type.name || this.freeAmountTypes[0].name;
    }

    public GetEmployeeTaxCard(employeeID: number, activeYear: number): Observable<EmployeeTaxCard> {
        return this.GetAll(
            'filter=EmployeeID eq ' + employeeID
            + ' and Year le ' + activeYear
            + '&orderby=Year DESC'
            + '&top=1'
            + '&expand=' + this.taxExpands())
            .pipe(
                map((response: EmployeeTaxCard[]) => response[0]),
                map((taxCard: EmployeeTaxCard) => this.CopyToNewYearIfNeeded(taxCard, activeYear))
            );
    }

    private CopyToNewYearIfNeeded(employeeTaxCard: EmployeeTaxCard, year: number): EmployeeTaxCard {
        if (!employeeTaxCard || employeeTaxCard.Year === year) {
            return employeeTaxCard;
        }
        employeeTaxCard.ID = 0;
        employeeTaxCard.Year = year;
        const keys = Object.keys(employeeTaxCard);
        keys
            .filter(key => key.length > 2 && key.endsWith('ID') && !key.toLowerCase().startsWith('employee'))
            .forEach(key => {
                employeeTaxCard[key] = 0;
                const  taxCard = employeeTaxCard[key.replace('ID', '')];
                if (taxCard) {
                    taxCard.ID = 0;
                }
            });
        return employeeTaxCard;
    }

    public hasTaxCard(taxcard: EmployeeTaxCard, year: number): boolean {
        return (taxcard && taxcard.ID) && !!(taxcard.loennFraBiarbeidsgiver ||
            taxcard.loennFraHovedarbeidsgiver ||
            taxcard.loennKunTrygdeavgiftTilUtenlandskBorger ||
            taxcard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger ||
            taxcard.loennTilUtenrikstjenestemann ||
            taxcard.pensjon) && taxcard.Year === year;
    }

    public taxExpands(): string {
        return this.expandOptionsNewTaxcardEntity.toString();
    }

    public isEmployeeTaxcard2018Model(employeetaxcard: EmployeeTaxCard): boolean {
        return !!(employeetaxcard && employeetaxcard.loennFraHovedarbeidsgiver);
    }

    public updateModelTo2018(employeetaxcard: EmployeeTaxCard, employeeID: number): Observable<EmployeeTaxCard> {
        return super.GetNewEntity(this.expandOptionsNewTaxcardEntity, EMPLOYEE_TAX_KEY)
            .switchMap((emptaxcard: EmployeeTaxCard) => {
                emptaxcard.EmployeeID = employeeID;
                this.setNumericValues(employeetaxcard);
                emptaxcard['_createguid'] = super.getNewGuid();
                if (employeetaxcard.NotMainEmployer) {
                    emptaxcard.loennFraBiarbeidsgiver.Table = employeetaxcard.Table;
                    emptaxcard.loennFraBiarbeidsgiver.Percent = employeetaxcard.Percent;
                    emptaxcard.loennFraBiarbeidsgiver.NonTaxableAmount = employeetaxcard.NonTaxableAmount;
                } else {
                    emptaxcard.loennFraHovedarbeidsgiver.Table = employeetaxcard.Table;
                    emptaxcard.loennFraHovedarbeidsgiver.Percent = employeetaxcard.Percent;
                    emptaxcard.loennFraHovedarbeidsgiver.NonTaxableAmount = employeetaxcard.NonTaxableAmount;
                }
                emptaxcard.NotMainEmployer = employeetaxcard.NotMainEmployer;

                return Observable.of(emptaxcard);
            });
    }

    public setNumericValues(employeeTaxCard: EmployeeTaxCard, year: number = 0) {
        if (year === 0) {
            year = employeeTaxCard.Year;
        }
        if (year > 2017) {

            if (!!employeeTaxCard.loennFraHovedarbeidsgiver) {
                employeeTaxCard.loennFraHovedarbeidsgiver.Percent = employeeTaxCard.loennFraHovedarbeidsgiver.Percent || 0;
            }
            if (!!employeeTaxCard.loennFraBiarbeidsgiver) {
                employeeTaxCard.loennFraBiarbeidsgiver.Percent = employeeTaxCard.loennFraBiarbeidsgiver.Percent || 0;
            }
            if (!!employeeTaxCard.pensjon) {
                if (!employeeTaxCard.pensjonID) {
                    employeeTaxCard.pensjon._createguid = super.getNewGuid();
                }
                employeeTaxCard.pensjon.Percent = employeeTaxCard.pensjon.Percent || 0;
            }
            if (!!employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorger) {
                employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorger.Percent
                = employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorger.Percent || 0;
            }
            if (!!employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger) {
                employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Percent
                = employeeTaxCard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Percent || 0;
            }
            if (!!employeeTaxCard.ufoereYtelserAndre) {
                employeeTaxCard.ufoereYtelserAndre.Percent = employeeTaxCard.ufoereYtelserAndre.Percent || 0;
            }

        } else {
            if (!!employeeTaxCard.Percent) {
                employeeTaxCard.Percent = employeeTaxCard.Percent || 0;
            }
            if (!!employeeTaxCard.SecondaryPercent) {
                employeeTaxCard.SecondaryPercent = employeeTaxCard.SecondaryPercent || 0;
            }

        }
    }

    public getTaxCardPercentAndTable(taxCard: EmployeeTaxCard, year = taxCard && taxCard.Year): {percent: string, table: string} {

        if (year <= 2017) {
            return this.formatTaxCardInfo(this.getTaxCardPercentAndTable2017(taxCard));
        }

        return this.formatTaxCardInfo(this.getTaxCardPercentAndTableFrom2018(taxCard));
    }

    private formatTaxCardInfo(taxInfo: {percent: string, table: string}): {percent: string, table: string} {
        return {
            percent: taxInfo.percent ? `(${taxInfo.percent}%)` : '',
            table: taxInfo.table ? `(${taxInfo.table})` : ''
        };
    }

    private getTaxCardPercentAndTable2017(taxCard: EmployeeTaxCard): {percent: string, table: string} {
        if (!taxCard) {
            return {
                percent: '50',
                table: ''
            };
        }
        return {
            percent: `${taxCard.Percent || ''}` || (taxCard.Table ? '' : '50'),
            table: taxCard.Table || ''
        };
    }

    private getTaxCardPercentAndTableFrom2018(taxCard: EmployeeTaxCard): {percent: string, table: string} {
        if (!taxCard) {
            return {
                percent: '',
                table: ''
            };
        }

        const taxCards = [
            ...this.addTaxCard((taxCard.NotMainEmployer ? taxCard.loennFraBiarbeidsgiver : taxCard.loennFraHovedarbeidsgiver)),
            ...this.addTaxCard(taxCard.loennKunTrygdeavgiftTilUtenlandskBorger),
            ...this.addTaxCard(taxCard.loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger),
            ...this.addTaxCard(taxCard.loennTilUtenrikstjenestemann),
            ...this.addTaxCard(taxCard.pensjon)
        ];

        if (!taxCards.length || taxCards.length > 1) {
            return {
                percent: '',
                table: ''
            };
        }

        return {
            percent: `${taxCards[0].Percent || ''}`,
            table: taxCards[0].Table || ''
        };

    }

    private addTaxCard(taxCard: TaxCard): TaxCard[] {
        if (!taxCard) { return []; }
        return (taxCard.Table || taxCard.Percent) ? [taxCard] : [];
    }

    public getLayout(layoutID: string, employeeTaxcard: EmployeeTaxCard): Observable<any> {
        if (employeeTaxcard.Year > 2017) {
            return Observable.of({
                Name: layoutID,
                BaseEntity: 'EmployeeTaxCard',
                Fields: [
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'TaxBtn',
                        FieldType: FieldType.BUTTON,
                        Label: 'Elektronisk skattekort',
                        FieldSet: 1,
                        Legend: 'Generelt',
                        Section: 0,
                        Options: {
                            class: 'taxbtn'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: '_lastUpdated',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        ReadOnly: true,
                        Label: 'Sist oppdatert',
                        FieldSet: 1,
                        Section: 0,
                        openByDefault: true,
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'ResultatStatus',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Resultat status',
                        FieldSet: 1,
                        Section: 0,
                        Options: {
                            source: [
                                { id: 0, statusname: 'ikkeSkattekort', name: 'Ikke skattekort' },
                                { id: 1, statusname: 'vurderArbeidstillatelse', name: 'Vurder arbeidstillatelse' },
                                { id: 3, statusname: 'ikkeTrekkplikt', name: 'Ikke trekkplikt' },
                                { id: 1, statusname: 'skattekortopplysningerOK', name: 'Skattekort OK' },
                                { id: 1, statusname: 'ugyldigOrganisasjonsnummer', name: 'Ugyldig orgnr' },
                                { id: 1, statusname: 'ugyldigFoedselsEllerDnummer', name: 'Ugyldig f-nr/d-nr' },
                                { id: 1, statusname: 'utgaattDnummerSkattekortForFoedselsnummerErLevert',
                                    name: 'Utgått d-nr, skattekort for f-nr er levert' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'statusname',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'Tilleggsopplysning',
                        FieldType: FieldType.TEXT,
                        ReadOnly: true,
                        Label: 'Tilleggsopplysning status',
                        FieldSet: 1,
                        Section: 0,
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
                        Property: 'loennFraHovedarbeidsgiver.Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Tabell',
                        FieldSet: 2,
                        Legend: 'Hovedarbeidsgiver',
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraHovedarbeidsgiver.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraHovedarbeidsgiver.freeAmountType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Frikort type',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            source: [
                                { id: FreeAmountType.None, name: 'Ingen' },
                                { id: FreeAmountType.WithAmount, name: 'Frikort med beløp' },
                                { id: FreeAmountType.NoLimit, name: 'Frikort uten beløp' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'id',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraHovedarbeidsgiver.NonTaxableAmount',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Frikortbeløp',
                        FieldSet: 2,
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
                        Label: 'Antall måneder trekk',
                        FieldSet: 2,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 3,
                        Legend: 'Biarbeidsgiver',
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.freeAmountType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Frikort type',
                        FieldSet: 3,
                        Section: 0,
                        Options: {
                            source: [
                                { id: FreeAmountType.None, name: 'Ingen' },
                                { id: FreeAmountType.WithAmount, name: 'Frikort med beløp' },
                                { id: FreeAmountType.NoLimit, name: 'Frikort uten beløp' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'id',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennFraBiarbeidsgiver.NonTaxableAmount',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Frikortbeløp',
                        FieldSet: 3,
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
                        Label: 'Tabell',
                        FieldSet: 4,
                        Legend: 'Pensjon',
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 4,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.freeAmountType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Frikort type',
                        FieldSet: 4,
                        Section: 0,
                        Options: {
                            source: [
                                { id: FreeAmountType.None, name: 'Ingen' },
                                { id: FreeAmountType.NoLimit, name: 'Frikort uten beløp' }
                            ],
                            template: (obj) => `${obj.id} - ${obj.name}`,
                            valueProperty: 'id',
                            displayProperty: 'name'
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'pensjon.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Antall måneder trekk',
                        FieldSet: 4,
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
                        Label: 'Tabell',
                        FieldSet: 5,
                        Legend: 'Trygd utenlandsk borger',
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorger.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 5,
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
                        Label: 'Antall måneder trekk',
                        FieldSet: 5,
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
                        Label: 'Tabell',
                        FieldSet: 6,
                        Legend: 'Grensegjenger',
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 6,
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
                        Label: 'Antall måneder trekk',
                        FieldSet: 6,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'ufoereYtelserAndre.Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Prosent',
                        FieldSet: 7,
                        Legend: 'Uføreytelser fra andre',
                        Section: 0,
                        openByDefault: true,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'ufoereYtelserAndre.AntallMaanederForTrekk',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Antall måneder trekk',
                        FieldSet: 7,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    }]
            });
        } else {
            return Observable.of({
                Name: layoutID,
                BaseEntity: 'EmployeeTaxCard',
                Fields: [
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'TaxBtn',
                        FieldType: FieldType.BUTTON,
                        Label: 'Elektronisk skattekort',
                        FieldSet: 10,
                        Legend: 'Skatt',
                        Section: 0
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'Table',
                        FieldType: FieldType.TEXT,
                        Label: 'Hovedarbeidsgiver tabell',
                        FieldSet: 10,
                        Section: 0,
                        openByDefault: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'Percent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Hovedarbeidsgiver prosent',
                        FieldSet: 10,
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
                        FieldSet: 10,
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
                        FieldSet: 10,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: '_lastUpdated',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        ReadOnly: true,
                        Label: 'Sist oppdatert',
                        FieldSet: 10,
                        Section: 0,
                        openByDefault: true,
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'ikkeTrekkPlikt',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Ikke trekkpliktig',
                        FieldSet: 10,
                        Section: 0,
                        Hidden: true
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'NotMainEmployer',
                        FieldType: FieldType.CHECKBOX,
                        Label: 'Biarbeidsgiver',
                        FieldSet: 10,
                        Section: 0
                    },
                    {
                        EntityType: 'EmployeeTaxCard',
                        Property: 'NonTaxableAmount',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Frikortbeløp',
                        FieldSet: 10,
                        Section: 0,
                        Options: {
                            format: 'Money',
                            decimalLength: 2
                        }
                    }]
            });
        }
    }
}
