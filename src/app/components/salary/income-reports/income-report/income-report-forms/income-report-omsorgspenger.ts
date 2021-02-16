import { Component, Input, SimpleChanges } from '@angular/core';
import { IncomeReportData, LocalDate } from '@uni-entities';
import { IPeriod } from '@uni-framework/interfaces/interfaces';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { IncomeReportStore } from '../../income-reports.store';

class DelvisFravaer {
    public dato: LocalDate;
    public timer: number;
}

@Component({
    selector: 'income-report-omsorgspenger',
    templateUrl: './income-report-omsorgspenger.html'
})

export class IncomeReportOmsorgspenger {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    fieldsRefusjonOmsorgspenger$ = new BehaviorSubject<UniFieldLayout[]>([]);
    delvisFravaersListe: any[];
    delvisFravaer: DelvisFravaer = new DelvisFravaer;
    askForOmsorgspenger: boolean = false;

    constructor(private incomeReportStore: IncomeReportStore) { }

    public ngOnChanges() {
        if (this.incomereport && this.incomereport['Report'].Skjemainnhold.omsorgspenger) {
            this.askForOmsorgspenger = true;
            this.delvisFravaersListe = this.incomereport['Report'].Skjemainnhold.omsorgspenger?.delvisFravaersListe;
        } else {
            this.askForOmsorgspenger = false;
            this.delvisFravaersListe = [];
        }
        this.setupFieldsRefusjonOmsorgspenger();

    }

    public deletePartly(i) {
        if (this.readOnly) {
            return;
        }
        if (i > -1) {
            this.incomereport['Report'].Skjemainnhold.omsorgspenger.delvisFravaersListe.splice(i, 1);
            this.incomeReportStore.updateStore(this.incomereport);
        }
    }

    addPartlyPeriod() {
        if (this.readOnly) {
            return;
        }
        const existing = this.incomereport['Report'].Skjemainnhold.omsorgspenger.delvisFravaersListe?.length;
        this.incomereport['Report'].Skjemainnhold.omsorgspenger.delvisFravaersListe[existing]
            = { ...this.delvisFravaer, dato: moment(this.delvisFravaer.dato).format('YYYY-MM-DD') };
        this.delvisFravaer = new DelvisFravaer();
        this.incomeReportStore.updateStore(this.incomereport);
    }

    onPeriodsChange(periods: IPeriod[]) {
        if (this.readOnly) {
            return;
        }
        this.incomereport['Report'].Skjemainnhold.omsorgspenger.fravaersPerioder = periods;
        this.incomeReportStore.updateStore(this.incomereport);
    }

    demandsRefusjonChange(event) {
        if (this.readOnly) {
            return;
        }
        this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMndSpecified = event.value;
        if (this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep && event.value) {
            this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMnd
                = this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep;
        }
        this.incomeReportStore.updateStore(this.incomereport);
    }

    setupFieldsRefusjonOmsorgspenger() {
        this.fieldsRefusjonOmsorgspenger$.next([
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.refusjon.refusjonsbeloepPrMnd',
                FieldType: FieldType.NUMERIC,
                ReadOnly: true,
                Label: 'Oppgi refusjonsbeløp per måned'
            }
        ]);

    }

}
