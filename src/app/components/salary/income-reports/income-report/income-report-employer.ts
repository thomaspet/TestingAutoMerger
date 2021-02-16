import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { BehaviorSubject } from 'rxjs';
import { IncomeReportStore } from '../income-reports.store';
import { IncomeReportHelperService } from '../shared/shared-services/incomeReportHelperService';

@Component({
    selector: 'income-report-employer',
    templateUrl: './income-report-employer.html'
})
export class IncomeReportEmployer {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    fieldsArbeidsgiver$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fieldsArbeidstaker$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fieldsYtelse$ = new BehaviorSubject<UniFieldLayout[]>([]);

    constructor(
        private incomeReportStore: IncomeReportStore,
        private incomeReportHelperService: IncomeReportHelperService,
    ) { }

    ngOnChanges() {
        if (this.incomereport) {
            this.setupForms();
        }
    }

    ngOnDestroy() {
        this.fieldsArbeidsgiver$.complete();
        this.fieldsArbeidstaker$.complete();
        this.fieldsYtelse$.complete();
    }

    onChangeEvent(changes: SimpleChanges) {
        this.incomeReportStore.updateStore({ ...this.incomereport });
    }

    private setupForms() {
        this.setupArbeidsgiverField();
        this.setupArbeidstakerField();
        this.setupYtelseField();
    }

    setupArbeidsgiverField() {
        this.fieldsArbeidsgiver$.next(<UniFieldLayout[]>[
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsgiver.virksomhetsnummer',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Virksomhetsnummer'
            },
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsgiver.kontaktinformasjon.kontaktinformasjonNavn',
                FieldType: FieldType.TEXT,
                ReadOnly: this.readOnly,
                Label: 'Ditt navn'
            },
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsgiver.kontaktinformasjon.telefonnummer',
                FieldType: FieldType.TEXT,
                ReadOnly: this.readOnly,
                Label: 'Ditt telefonnummer'
            }
        ]);
    }
    setupArbeidstakerField() {
        this.fieldsArbeidstaker$.next(<UniFieldLayout[]>[
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidstakerFnr',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Arbeidstakers fødelsnummer',
                Classes: 'half-width'
            },
            {
                EntityType: 'IncomeReport',
                Property: 'Employment.Employee.BusinessRelationInfo.Name',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Arbeidstakers navn',
                Classes: 'half-width'
            },
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.naerRelasjon',
                LineBreak: true,
                FieldType: FieldType.RADIOGROUP,
                Options: {
                    source: [{ value: true, text: 'Ja' }, { value: false, text: 'Nei' }],
                    labelProperty: 'text',
                    valueProperty: 'value'
                },
                ReadOnly: this.readOnly,
                Label: 'Er det nær relasjon mellom deg og arbeidstaker, eller sender du inn på vegne av deg selv?',
                Classes: 'income-report-radio-button-group'
            }
        ]);
    }


    setupYtelseField() {
        this.fieldsYtelse$.next(<UniFieldLayout[]>[
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.ytelse',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Ytelse'
            },
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.aarsakTilInnsending',
                FieldType: FieldType.DROPDOWN,
                Label: 'Årsak til innsending',
                Options: {
                    source: this.incomeReportHelperService
                        .getAarsakTilInnsendingCodes(),
                    valueProperty: 'Code',
                    displayProperty: 'Value2',
                    hideDeleteButton: true
                },
                ReadOnly: this.readOnly,
            }
        ]);
    }
}
