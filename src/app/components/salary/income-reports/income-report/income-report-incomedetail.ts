import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IncomeReportData } from '@uni-entities';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { IModalOptions, UniModalService } from '@uni-framework/uni-modal';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { IncomeReportStore } from '../income-reports.store';
import { IncomeReportHelperService } from '../shared/shared-services/incomeReportHelperService';
import { YtelseKodeliste } from '../shared/shared-services/incomeReportsService';
import { IncomeReportChangeIncomeModal } from './income-report-modals/change-income-modal/income-report-changeincome.modal';
import { IncomeReportMonthlyPayModal } from './income-report-modals/monthly-pay-modal/income-report-monthlypay.modal';


@Component({
    selector: 'income-report-incomedetail',
    templateUrl: './income-report-incomedetail.html',
    styleUrls: ['./income-report-incomedetail.sass']
})


export class IncomeReportIncomeDetail implements OnInit {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    fieldsInntekstmeldingBasis$ = new BehaviorSubject<UniFieldLayout[]>([]);

    showAarsakbelopIsChanged: boolean = false;
    hasMultipleEmployment: boolean = false;
    checkIkkeFravaer: boolean = false;
    isForeldrepenger: boolean = false;

    public arbeidsforholdText: string;

    constructor(
        private incomeReportHelperService: IncomeReportHelperService,
        private incomeReportStore: IncomeReportStore,
        private toast: ToastService,
        private modalService: UniModalService) {
    }

    ngOnInit(): void {
    }

    ngOnChanges() {
        if (this.incomereport) {
            this.isForeldrepenger = this.incomereport.Type === YtelseKodeliste[YtelseKodeliste.Foreldrepenger];
            this.hasMultipleEmployment = this.incomereport['Report'].Skjemainnhold.arbeidsforhold.arbeidsforholdId !== '';

            if (this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.aarsakVedEndring) {
                this.incomereport['KorrigertLonn'] = true;
                this.showAarsakbelopIsChanged = true;
            } else {
                this.showAarsakbelopIsChanged = false;
            }

            this.checkIkkeFravaer = this.incomereport['Report'].Skjemainnhold.
                sykepengerIArbeidsgiverperioden?.begrunnelseForReduksjonEllerIkkeUtbetalt !== undefined
                && this.incomereport.Type !== YtelseKodeliste[YtelseKodeliste.Sykepenger];

            this.setupArbeidstakerFields();
            this.setTexts(this.incomereport.Type);
        }
    }

    onChangeEvent(changes: SimpleChanges) {
        if (changes['KorrigertLonn']) {
            this.showAarsakbelopIsChanged = changes['KorrigertLonn'].currentValue;
            if (!this.showAarsakbelopIsChanged) {
                this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.aarsakVedEndring = '';
            }
            this.incomeReportStore.updateStore(this.incomereport);
        }
        if (changes['Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep']) {
            this.setMonthlyPayChange(changes['Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep'].currentValue);
            this.incomeReportStore.updateStore({ ...this.incomereport });
        } else {
            this.incomeReportStore.updateStore(this.incomereport);
        }
        this.setupArbeidstakerFields();
    }

    IkkeFravaerChange(event) {
        this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden.begrunnelseForReduksjonEllerIkkeUtbetalt = event.value;
        this.incomeReportStore.updateStore(this.incomereport);
    }

    multipleEmploymentChange(event) {
        if (event.value) {
            this.incomereport['Report'].Skjemainnhold.arbeidsforhold.arbeidsforholdId = this.incomereport.EmploymentID;
        } else {
            this.incomereport['Report'].Skjemainnhold.arbeidsforhold.arbeidsforholdId = '';
        }
        this.incomeReportStore.updateStore(this.incomereport);
    }

    OpenMonthlyPayModal() {
        if (this.readOnly) {
            return;
        }
        let fromDate: any = moment(new Date()).format('YYYY-MM-DD');
        if (this.incomereport['Report'].Skjemainnhold.arbeidsforhold?.foersteFravaersdagSpecified) {
            fromDate = this.incomereport['Report'].Skjemainnhold.arbeidsforhold.foersteFravaersdag;
        }
        if (this.incomereport['Report'].Skjemainnhold.startdatoForeldrepengeperiodeSpecified) {
            fromDate = this.incomereport['Report'].Skjemainnhold.startdatoForeldrepengeperiode;
        }

        const options: IModalOptions = {
            data: { employmentID: this.incomereport.EmploymentID, fromDate: fromDate }
        };

        this.modalService.open(IncomeReportMonthlyPayModal, options).onClose.subscribe(response => {
            if (response) {
                if (typeof (response) === 'number') {
                    this.incomereport['Report'].Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep = response;
                    this.setMonthlyPayChange(response);
                    this.toast.addToast('Forslag til beregnet månedsinntekt er oppdatert', ToastType.good, 5);
                    this.incomeReportStore.updateStore({ ...this.incomereport });
                    this.setupArbeidstakerFields();
                }
            }
        });
    }

    private setMonthlyPayChange(monthlyPay: number) {
        if (this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMndSpecified) {
            this.incomereport['Report'].Skjemainnhold.refusjon.refusjonsbeloepPrMnd = monthlyPay;
        }
        if (this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden?.arbeidsgiverperiodeListe) {
            const agpPay = (monthlyPay / 162.5) * 7.5 * 12;
            this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden.bruttoUtbetalt = agpPay;
            this.incomereport['Report'].Skjemainnhold.sykepengerIArbeidsgiverperioden.bruttoUtbetaltSpecified = true;
        }
    }

    private setTexts(incomeReportType: string) {
        switch (incomeReportType) {
            case YtelseKodeliste[YtelseKodeliste.Foreldrepenger]:
                this.arbeidsforholdText = 'Startdato for foreldrepengeperioden er datoen permisjonen starter eller skulle ha startet, hvis det er søkt om utsettelse.  Er det søkt om utsettelse er det altså første dag i utsettelsesperioden som settes som startdato.';
                break;
            case YtelseKodeliste[YtelseKodeliste.Omsorgspenger]:
                this.arbeidsforholdText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Opplaeringspenger]:
                this.arbeidsforholdText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Pleiepenger]:
                this.arbeidsforholdText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Svangerskapspenger]:
            case YtelseKodeliste[YtelseKodeliste.Sykepenger]:
                this.arbeidsforholdText = 'Første fraværsdag er første dagen i det fraværet som går utover arbeidsgiverperioden.  Starter fraværet med egenmelding og deretter sykemelding, er det første dagen i den egenmeldte perioden som er første fraværsdag. Datoen for første fraværsdag kan avvike fra første fraværsdag i arbeidsgiverperioden, som teller med dager i tidligere fravær innenfor 16-dagers-regelen.';
                break;
        }
    }

    setupArbeidstakerFields() {
        this.fieldsInntekstmeldingBasis$.next([
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsforhold.foersteFravaersdag',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: this.readOnly,
                Hidden: this.incomereport.Type !== YtelseKodeliste[YtelseKodeliste.Sykepenger]
                    && this.incomereport.Type !== YtelseKodeliste[YtelseKodeliste.Svangerskapspenger],
                Label: 'Første fraværsdag'
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.startdatoForeldrepengeperiode',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                ReadOnly: this.readOnly,
                Hidden: this.incomereport.Type !== YtelseKodeliste[YtelseKodeliste.Foreldrepenger],
                Label: 'Oppgi startdato for foreldrepengeperioden'
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'KorrigertLonn',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: this.readOnly,
                Hidden: this.incomereport['Report'].Skjemainnhold.aarsakTilInnsending === 'Ny',
                Label: 'Har beregnet månedslønn blitt korrigert?',
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.aarsakVedEndring',
                FieldType: FieldType.DROPDOWN,
                ReadOnly: this.readOnly,
                Label: 'Årsak til endring?',
                Hidden: !this.showAarsakbelopIsChanged,
                Options: {
                    source: this.incomeReportHelperService.getEndringsaarsaker(),
                    valueProperty: 'Code',
                    displayProperty: 'Value2',
                    hideDeleteButton: true
                }
            },
            <UniFieldLayout>
            {
                EntityType: 'IncomeReport',
                Property: 'Report.Skjemainnhold.arbeidsforhold.beregnetInntekt.beloep',
                FieldType: FieldType.NUMERIC,
                ReadOnly: this.readOnly,
                Label: 'Beregnet månedslønn'
            }
        ]);
    }

}
