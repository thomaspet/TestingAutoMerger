import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { UniTranslationService } from '@app/services/services';
import { Observable } from 'rxjs';
import { TaxDrawFactor } from '@uni-entities';
import { Injectable } from '@angular/core';

@Injectable()
export class PayrollRunLayoutService {

    constructor(
        private translate: UniTranslationService
    ) { }

    private getTaxHelpText() {
        const halfTax = 'Halv skatt(desember): Vil gi halv skatt på lønnsavregninger med månedslønn' +
            ' og ikke skatt på lønnsavregninger med 14-dagerslønn.' +
            ' Eventuelle unntak fra dette håndteres ut fra oppgitt skattekort.';
        const noTax = 'Ikke skatt: Systemet vil ikke beregne forskuddstrekk.' +
            ' Det er kun poster du taster manuelt som vil bli tatt med.' +
            ' Dette valget bør derfor kun benyttes for historikk og eventuelle korreksjoner.';
        return halfTax + `<br><br>` + noTax;
    }

    public layout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            BaseEntity: 'Payrollrun',
            Fields: [
                {
                    EntityType: 'payrollrun',
                    Property: 'ID',
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    Label: 'Nummer',
                    Legend: this.translate.translate('NAVBAR.PAYROLL'),
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_ID'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'Description',
                    FieldType: FieldType.TEXT,
                    Label: 'Beskrivelse',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_description',
                    Validations: [(value, field: UniFieldLayout) => {
                        if (!!value) {
                            return;
                        }

                        return {
                            field: field,
                            value: value,
                            errorMessage: `Må fylles ut før lønnspostene kan vises`,
                            isWarning: false,
                        };
                    }]
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'StatusCode',
                    Hidden: true,
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    Label: 'Status',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true,
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'taxdrawfactor',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Skattetrekk',
                    Tooltip: {
                        Text: this.getTaxHelpText(),
                        Alignment: 'bottom'
                    },
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_taxdrawfactor',
                    Options: {
                        source: [
                            {Indx: TaxDrawFactor.Standard, Name: 'Full skatt'},
                            {Indx: TaxDrawFactor.Half, Name: 'Halv skatt(desember)'},
                            {Indx: TaxDrawFactor.None, Name: 'Ikke skatt'}],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    }
                },
                {
                    EntityType: 'payrollrun',
                    Property: '',
                    Hidden: true,
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Behandling av fastlønn i feriemåned',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true,
                    Options: {
                        source: [
                            {Indx: 0, Name: 'Vanlig'},
                            {Indx: 1, Name: 'Ferielønn (+1/26)'},
                            {Indx: 2, Name: 'Ferielønn (-1/26)'},
                            {Indx: 1, Name: 'Ferielønn (-4/26)'},
                            {Indx: 2, Name: 'Ferielønn (-3/22)'}],
                        displayProperty: 'Name',
                        valueProperty: 'Indx'
                    }
                },
                {
                    EntityType: 'payrollrun',
                    Property: '_IncludeRecurringPosts',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Inkluder faste poster/trekk',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_excludeRecurringPosts'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'HolidayPayDeduction',
                    FieldType: FieldType.CHECKBOX,
                    Label: 'Trekk i fastlønn for ferie',
                    FieldSet: 1,
                    Section: 0,
                    Classes: 'payrollDetails_holidayPayDeduction',
                },
                {
                    EntityType: 'payrollrun',
                    Property: '1',
                    Hidden: true,
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: true,
                    Label: 'Ansatte med negativ lønn utelates',
                    FieldSet: 1,
                    Section: 0,
                    hasLineBreak: true
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'FromDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fra dato',
                    FieldSet: 2,
                    Legend: 'Datoer og fritekst',
                    Section: 0,
                    Classes: 'payrollDetails_fromDate'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'ToDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Til dato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_toDate',
                    hasLineBreak: true
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'PayDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Utbetalingsdato',
                    FieldSet: 2,
                    Section: 0,
                    Classes: 'payrollDetails_payDate'
                },
                {
                    EntityType: 'payrollrun',
                    Property: 'FreeText',
                    FieldType: FieldType.TEXTAREA,
                    Label: 'Fritekst til lønnslipp',
                    MaxLength: 255,
                    FieldSet: 2,
                    Section: 0,
                    LineBreak: true,
                    Classes: 'payrollDetails_freeText',
                    Options: {
                        rows: 4
                    }
                },
            ]
        }]);
    }
}
