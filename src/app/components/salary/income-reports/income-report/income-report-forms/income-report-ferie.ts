import { Component, Input } from '@angular/core';
import { IncomeReportData } from '@uni-entities';
import { IPeriod } from '@uni-framework/interfaces/interfaces';
import { IncomeReportStore } from '../../income-reports.store';
import { YtelseKodeliste } from '../../shared/shared-services/incomeReportsService';

class AvtaltFerie {
    public fom: Date = new Date();
    public tom: Date = new Date();
}


@Component({
    selector: 'income-report-ferie',
    templateUrl: './income-report-ferie.html'
})

export class IncomeReportFerie {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    askForFerie: boolean = false;
    _hasFerie: boolean = false;
    get hasFerie(): boolean {
        return this._hasFerie;
    }
    set hasFerie(val: boolean) {
        this._hasFerie = val;
        if (!val) {
            this.incomereport['Report'].Skjemainnhold.arbeidsforhold.avtaltFerieListe = [];
        }
    }
    avtaltPeriode: AvtaltFerie = new AvtaltFerie;

    public ferieText: string;

    constructor(private incomeReportStore: IncomeReportStore) { }

    public ngOnChanges() {
        if (this.incomereport && this.incomereport['Report'].Skjemainnhold.arbeidsforhold.avtaltFerieListe) {
            this.askForFerie = true;
            if (this.incomereport['Report'].Skjemainnhold.arbeidsforhold?.avtaltFerieListe?.length > 0) {
                this.hasFerie = true;
            } else {
                this.hasFerie = false;
            }
            this.setTexts(this.incomereport.Type);
        } else {
            this.askForFerie = false;
        }
    }

    private setTexts(incomeReportType: string) {
        switch (incomeReportType) {
            case YtelseKodeliste[YtelseKodeliste.Foreldrepenger]:
                this.ferieText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Omsorgspenger]:
                this.ferieText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Opplaeringspenger]:
                this.ferieText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Pleiepenger]:
                this.ferieText = '';
                break;
            case YtelseKodeliste[YtelseKodeliste.Svangerskapspenger]:
            case YtelseKodeliste[YtelseKodeliste.Sykepenger]:
                this.ferieText = 'Skal den ansatte avvikle ferie under sykefraværet (merk! dette betyr at det ikke kreves refusjon av sykepenger i perioden det oppgis at den ansatte har ferie), så fylles datoene for ferien ut her. Legg til en linje for hver ferieperiode. En kan legge til så mange ferieperioder en ønsker.';
                break;
        }
    }



    onPeriodsChange(periods: IPeriod[]) {
        this.incomereport['Report'].Skjemainnhold.arbeidsforhold.avtaltFerieListe = periods;
        this.incomeReportStore.updateStore(this.incomereport);
    }

}
