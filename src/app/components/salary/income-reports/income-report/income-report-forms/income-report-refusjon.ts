import { Input, SimpleChanges } from '@angular/core';
import { Component } from '@angular/core';
import { IncomeReportData, LocalDate } from '@uni-entities';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { IncomeReportStore } from '../../income-reports.store';
import { YtelseKodeliste } from '../../shared/shared-services/incomeReportsService';
import { IncomeReportChangeIncomeModal } from '../income-report-modals/change-income-modal/income-report-changeincome.modal';


@Component({
    selector: 'income-report-refusjon',
    templateUrl: './income-report-refusjon.html'
})

export class IncomeReportRefusjon {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    constructor(
        private incomeReportStore: IncomeReportStore,
        private toast: ToastService,
        private modalService: UniModalService) { }

    fieldsRefusjon$ = new BehaviorSubject<UniFieldLayout[]>([]);

    demandsRefusjon: boolean = false;
    changeDemand: boolean = false;
    showRefusjonOpphoerDato: boolean = false;

    refusjonsopphoersdato: Date;

    public refusjonText: string;

    ngOnChanges() {
        if (this.incomereport) {
            if (this.incomereport.hasOwnProperty('Report')) {
                if (this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMndSpecified) {
                    this.demandsRefusjon = true;
                } else {
                    this.demandsRefusjon = false;
                }

                if (this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsopphoersdatoSpecified) {
                    this.showRefusjonOpphoerDato = true;
                    this.refusjonsopphoersdato = this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsopphoersdato;
                } else {
                    this.showRefusjonOpphoerDato = false;
                }

                if (this.incomereport['Report'].Skjemainnhold.refusjon.endringIRefusjonListe?.length > 0) {
                    this.changeDemand = true;
                } else {
                    this.changeDemand = false;
                }
            }
            this.incomereport['_beregnetInntekt'] = 'OpenChangeIncomeModal();';
            this.setupFieldsRefusjon();
            this.setTexts(this.incomereport.Type);
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes['Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep']) {
            if (this.demandsRefusjon) {
                const beregnetInntekt = changes['Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep'].currentValue;
                this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMnd = beregnetInntekt;
            }
        }

        if (changes['RefusjonOpphoerer']) {
            this.showRefusjonOpphoerDato = changes['RefusjonOpphoerer'].currentValue;
        }
        this.incomeReportStore.updateStore(this.incomereport);
        this.setupFieldsRefusjon();
    }

    deleteIncomeChange(item) {
        if (this.readOnly) {
            return;
        }
        const index = this.incomereport['Report'].Skjemainnhold.refusjon.endringIRefusjonListe.indexOf(item, 0);
        if (index > -1) {
            this.incomereport['Report'].Skjemainnhold.refusjon.endringIRefusjonListe.splice(index, 1);
            this.incomeReportStore.incomeReportIsDirty = true;
        }
    }

    demandsRefusjonChange(event) {
        this.demandsRefusjon = event.value;
        if (this.demandsRefusjon) {
            if (this.incomereport['Report'].Skjemainnhold.arbeidsforhold?.beregnetInntekt?.beloep > 0) {
                this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMnd
                    = this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep;
                this.incomeReportStore.updateStore(this.incomereport);
            }
        } else {
            this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMnd = '';
        }
    }

    refusjonsopphoersdatoChange(newDate) {
        this.refusjonsopphoersdato = newDate;
        this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsopphoersdato = moment(this.refusjonsopphoersdato).format('YYYY-MM-DD');
        this.incomeReportStore.updateStore(this.incomereport);
    }

    private setTexts(incomeReportType: string) {
        switch (incomeReportType) {
            case YtelseKodeliste[YtelseKodeliste.Foreldrepenger]:
                this.refusjonText = 'Nei, ingenting fylles ut. Er svaret Ja, må refusjonsbeløp per måned oppgis, dette hentes fra beregnet månedslønn, se forklaring under Arbeidsforhold. Er det endringer i refusjonskravet i fraværsperioden, velg Ja her, det må da legges til informasjon om dato det gjelder fra og Beløpet som det endres til. Opphører refusjonskravet i perioden (feks den ansatte slutter) så velges det Ja og dato for siste arbeidsdag legges inn her. Er det ingen endringer i kravet underveis i fraværet velges Nei begge steder.';
                break;
            case YtelseKodeliste[YtelseKodeliste.Omsorgspenger]:
                this.refusjonText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Opplaeringspenger]:
                this.refusjonText = 'Nei, ingenting fylles ut. Er svaret Ja, må refusjonsbeløp per måned oppgis, dette hentes fra beregnet månedslønn, se forklaring under Arbeidsforhold.  Er det endringer i refusjonskravet i fraværsperioden, velg Ja her, det må da legges til informasjon om dato det gjelder fra og Beløpet som det endres til. Opphører refusjonskravet i perioden (feks den ansatte slutter) så velges det Ja og dato for siste arbeidsdag legges inn her. Er det ingen endringer i kravet underveis i fraværet velges Nei begge steder. ';
                break;
            case YtelseKodeliste[YtelseKodeliste.Pleiepenger]:
                this.refusjonText = 'Nei, ingenting fylles ut. Er svaret Ja, må refusjonsbeløp per måned oppgis, dette hentes fra beregnet månedslønn, se forklaring under Arbeidsforhold.  Er det endringer i refusjonskravet i fraværsperioden, velg Ja her, det må da legges til informasjon om dato det gjelder fra og Beløpet som det endres til. Opphører refusjonskravet i perioden (feks den ansatte slutter) så velges det Ja og dato for siste arbeidsdag legges inn her. Er det ingen endringer i kravet underveis i fraværet velges Nei begge steder.';
                break;
            case YtelseKodeliste[YtelseKodeliste.Svangerskapspenger]:
                this.refusjonText = 'Første fraværsdag er første dagen i det fraværet som går utover arbeidsgiverperioden. Starter fraværet med egenmelding og deretter sykemelding, er det første dagen i den egenmeldte perioden som er første fraværsdag. Datoen for første fraværsdag kan avvike fra første fraværsdag i arbeidsgiverperioden, som teller med dager i tidligere fravær innenfor 16-dagers-regelen.';
                break;
            case YtelseKodeliste[YtelseKodeliste.Sykepenger]:
                this.refusjonText = 'Nei, ingenting fylles ut. Er svaret Ja, må refusjonsbeløp per måned oppgis, dette hentes fra beregnet månedslønn, se forklaring under Arbeidsforhold.  Er det endringer i refusjonskravet i fraværsperioden, velg Ja her, det må da legges til informasjon om dato det gjelder fra og Beløpet som det endres til. Opphører refusjonskravet i perioden (feks den ansatte slutter) så velges det Ja og dato for siste arbeidsdag legges inn her. Er det ingen endringer i kravet underveis i fraværet velges Nei begge steder.';
                break;
        }
    }

    OpenChangeIncomeModal() {
        if (this.readOnly) {
            return;
        }
        this.modalService.open(IncomeReportChangeIncomeModal).onClose.subscribe(response => {
            if (response) {
                this.incomereport['Report'].Skjemainnhold.refusjon.endringIRefusjonListe.push(response);
                this.incomeReportStore.incomeReportIsDirty = true;
                this.toast.addToast('Endring i refusjonskravet lagt til', ToastType.good, 5);
            }
        });
    }

    setupFieldsRefusjon() {
        this.fieldsRefusjon$.next([
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.refusjon.refusjonsbeloepPrMnd',
                FieldType: FieldType.NUMERIC,
                ReadOnly: this.readOnly,
                Label: 'Oppgi refusjonsbeløp per måned'
            }
        ]);
    }

}
