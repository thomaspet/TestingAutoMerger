import { Component, Input, SimpleChanges } from '@angular/core';
import { IncomeReportData } from '@uni-entities';
import { IPeriod } from '@uni-framework/interfaces/interfaces';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { BehaviorSubject, of } from 'rxjs';
import { IncomeReportStore } from '../../income-reports.store';
import { IncomeReportHelperService } from '../../shared/shared-services/incomeReportHelperService';
import { YtelseKodeliste } from '../../shared/shared-services/incomeReportsService';
const HAS_FULL_PAY_FIELD = '_arbeidsgiverPeriodeHasFullPay';

@Component({
    selector: 'income-report-arbeidsgiverperiode',
    templateUrl: './income-report-arbeidsgiverperiode.html',
    styleUrls: ['./income-report-arbeidsgiverperiode.sass']

})

export class IncomeReportArbeidsgiverperiode {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    fieldsSykepenger$ = new BehaviorSubject<UniFieldLayout[]>([]);
    isSykemelding: boolean = false;
    askForArbeidsgiverperiod: boolean = false;



    constructor(
        private incomeReportHelperService: IncomeReportHelperService,
        private store: IncomeReportStore,
    ) { }

    ngOnChanges() {
        if (this.incomereport && this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden) {
            if (this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden?.begrunnelseForReduksjonEllerIkkeUtbetalt) {
                this.incomereport[HAS_FULL_PAY_FIELD] = false;
            } else {
                this.incomereport[HAS_FULL_PAY_FIELD] = true;
            }
            this.isSykemelding = this.incomereport.Type === YtelseKodeliste[YtelseKodeliste.Sykepenger];
            this.setupSykepengerFields();
        }
    }

    onPeriodsChange(periods: IPeriod[]) {
        this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden.arbeidsgiverperiodeListe = periods;
        this.store.updateStore(this.incomereport);
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes[HAS_FULL_PAY_FIELD]) {
            if (!changes[HAS_FULL_PAY_FIELD].currentValue) {
                this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden.begrunnelseForReduksjonEllerIkkeUtbetalt = '';
            }
        }
        this.store.updateStore(this.incomereport);
        this.setupSykepengerFields();
    }

    setupSykepengerFields() {
        this.fieldsSykepenger$.next([
            <UniFieldLayout>{
                EntityType: 'IncomeReport',
                Property: HAS_FULL_PAY_FIELD,
                FieldType: FieldType.RADIOGROUP,
                ReadOnly: this.readOnly,
                Label: 'Er det utbetalt full lønn i arbeidsgiverperioden?',
                Options: {
                    source: [
                        {
                            label: 'Ja',
                            value: true,
                        },
                        {
                            label: 'Nei',
                            value: false,
                        }
                ],
                    valueProperty: 'value',
                    labelProperty: 'label',
                },
                Classes: 'income-report-radio-button-group'
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.sykepengerIArbeidsgiverperioden.begrunnelseForReduksjonEllerIkkeUtbetalt',
                FieldType: FieldType.DROPDOWN,
                Label: 'Velg begrunnelse for ingen eller redusert utbetaling',
                Hidden: this.incomereport[HAS_FULL_PAY_FIELD],
                ReadOnly: this.readOnly,
                Options: {
                    source: this.incomeReportHelperService.getRedusertUtbetalingsTyper(),
                    valueProperty: 'Code',
                    displayProperty: 'Value2',
                    hideDeleteButton: true
                }
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.sykepengerIArbeidsgiverperioden.bruttoUtbetalt',
                FieldType: FieldType.NUMERIC,
                ReadOnly: this.readOnly,
                Label: 'Oppgi brutto beløpet som er utbetalt i arbeidsgiverperioden',
                Hidden: false
            }
        ]);
    }

}
