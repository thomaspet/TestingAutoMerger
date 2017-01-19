import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn, ISortInfo} from 'unitable-ng2/main';
import {AmeldingData} from '../../../../unientities';
import * as moment from 'moment';

@Component({
    selector: 'amelding-receipt-view',
    templateUrl: './receipt.html'
})

export class AmeldingReceiptView {
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    private mottattLeveranserIPerioden: any[] = [];
    private alleAvvikNoder: any[] = [];
    private allAvvikGroupedByPeriod: any[] = [];
    private mottattLeveranserIPeriodenConfig: UniTableConfig;
    private showFeedback: boolean;
    private periods: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    constructor() {
        this.setupMottakTable();
    }

    public ngOnChanges() {
        this.showFeedback = false;
        if (this.currentAMelding) {
            this.getAlleAvvik();
        }
    }

    public rowSelected(event) {

    }

    public toggleCollapsed(index: number) {
        this.alleAvvikNoder[index].collapsed = !this.alleAvvikNoder[index].collapsed;
    }

    private setMottattLeveranser(leveranser, period) {
        if (leveranser instanceof Array) {
            leveranser.forEach(leveranse => {
                leveranse.periode = period;
                this.mottattLeveranserIPerioden.push(leveranse);
            });
        } else {
            leveranser.periode = period;
            this.mottattLeveranserIPerioden.push(leveranser);
        }
    }

    private getAlleAvvik() {
        if (this.currentAMelding.hasOwnProperty('feedBack')) {
            let feedback = this.currentAMelding.feedBack;
            if (feedback !== null) {
                this.alleAvvikNoder = [];

                let alleMottak = this.currentAMelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        this.setMottattLeveranser(mottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year) {
                            this.getAvvikRec(mottak, period);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        this.setMottattLeveranser(alleMottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year) {
                            this.getAvvikRec(alleMottak, period);
                        }
                    } else {
                        // When altinn would not accept sent amelding, check for avvik
                        this.getAvvikRec(alleMottak, this.currentAMelding.period);
                    }
                }
                this.groupAvvik();
                this.showFeedback = true;
            } else {
                this.showFeedback = false;
            }
        }
    }

    private getAvvikRec(obj, period) {
        for (var propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        if (obj.hasOwnProperty('arbeidsforholdId')) {
                            avvik.arbeidsforholdId = obj['arbeidsforholdId'];
                        }
                        if (obj.hasOwnProperty('yrke')) {
                            avvik.yrke = obj['yrke'];
                        }
                        if (obj.hasOwnProperty('beloep')) {
                            avvik.beloep = obj['beloep'];
                        }
                        if (obj.hasOwnProperty('fordel')) {
                            avvik.fordel = obj['fordel'];
                        }
                        if (obj.hasOwnProperty('loennsinntekt')) {
                            let loennObj = obj['loennsinntekt'];
                            if (loennObj.hasOwnProperty('beskrivelse')) {
                                avvik.loennsinntektBeskrivelse = loennObj['beskrivelse'];
                            }
                        }
                        avvik.belongsToPeriod = period;
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    let avvik = obj[propname];
                    if (obj.hasOwnProperty('arbeidsforholdId')) {
                        avvik.arbeidsforholdId = obj['arbeidsforholdId'];
                    }
                    if (obj.hasOwnProperty('beloep')) {
                        avvik.beloep = obj['beloep'];
                    }
                    if (obj.hasOwnProperty('fordel')) {
                        avvik.fordel = obj['fordel'];
                    }
                    if (obj.hasOwnProperty('loennsinntekt')) {
                        let loennObj = obj['loennsinntekt'];
                        if (loennObj.hasOwnProperty('beskrivelse')) {
                            avvik.loennsinntektBeskrivelse = loennObj['beskrivelse'];
                        }
                    }
                    avvik.belongsToPeriod = period;
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    this.getAvvikRec(obj[propname], period);
                }
            }
        }
    }

    private groupAvvik() {
        this.periods.forEach(period => {
            let periodAvvik = {periode: period, periodeAvvik: []};
            this.alleAvvikNoder.forEach(avvik => {
                if (period === avvik.belongsToPeriod) {
                    periodAvvik.periodeAvvik.push(avvik);
                }
            });
            if (periodAvvik.periodeAvvik.length) {
                this.allAvvikGroupedByPeriod.push(periodAvvik);
            }
        });
    }

    private setupMottakTable() {
        let refCol = new UniTableColumn('altinnReferanse', 'Altinn referanse', UniTableColumnType.Text);
        let meldingCol = new UniTableColumn('meldingsId', 'MeldingsID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let mldID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.meldingsId === amelding.messageID) {
                        mldID = amelding.ID;
                    }
                });
                return mldID === 0 ? dataItem.meldingsId : mldID;
            });
        let statusCol = new UniTableColumn('mottakstatus', 'Status', UniTableColumnType.Text);
        let tidCol = new UniTableColumn('tidsstempelFraAltinn', 'Tid i altinn', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                return moment(dataItem.tidsstempelFraAltinn).format('DD.MM.YYYY HH:mm');
            });
        let antallCol = new UniTableColumn('antallInntektsmottakere', 'Antall inntektsmottakere', UniTableColumnType.Text);
        let replaceCol = new UniTableColumn('erstatterMeldingsId', 'Erstatter ID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let replID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.erstatterMeldingsId === amelding.messageID) {
                        replID = amelding.ID;
                    }
                });
                return replID === 0 ? dataItem.erstatterMeldingsId : replID;
            });
        let agaCol = new UniTableColumn('mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift', 'Aga', UniTableColumnType.Money);
        let ftrekkCol = new UniTableColumn('mottattAvgiftOgTrekkTotalt.sumForskuddstrekk', 'Forskuddstrekk', UniTableColumnType.Money);
        let periodeCol = new UniTableColumn('periode', 'Periode', UniTableColumnType.Text);

        let orderBy: ISortInfo = {field: 'meldingsId', direction: -1};

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig(false, false)
        .setColumns([meldingCol, periodeCol, refCol, tidCol, statusCol, antallCol, replaceCol, agaCol, ftrekkCol]);
        this.mottattLeveranserIPeriodenConfig.defaultOrderBy = orderBy;
    }
}
