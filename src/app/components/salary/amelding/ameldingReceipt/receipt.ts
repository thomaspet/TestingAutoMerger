import {Component, Input} from '@angular/core';
import {
    UniTableConfig,
    UniTableColumnType,
    UniTableColumn,
} from '../../../../../framework/ui/unitable/index';
import {AmeldingData, CompanySalary} from '../../../../unientities';
import * as moment from 'moment';

@Component({
    selector: 'amelding-receipt-view',
    templateUrl: './receipt.html'
})

export class AmeldingReceiptView {
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    @Input() public companySalary: CompanySalary;
    private mottattLeveranserIPerioden: any[] = [];
    private alleAvvikNoder: any[] = [];
    private allAvvikGroupedByPeriod: any[] = [];
    private mottattLeveranserIPeriodenConfig: UniTableConfig;
    public showFeedback: boolean;
    private periods: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    private identificationObject: any = {};

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
            const feedback = this.currentAMelding.feedBack;
            if (feedback !== null) {
                this.alleAvvikNoder = [];

                const alleMottak = this.currentAMelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        this.setMottattLeveranser(mottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-')), 10) === this.currentAMelding.year) {
                            this.getAvvikRec(mottak, period);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        this.setMottattLeveranser(alleMottak.mottattLeveranse, period);
                        if (parseInt(pr.substring(0, pr.indexOf('-')), 10) === this.currentAMelding.year) {
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

    private buildAvvik(obj, avvik, period: number, props: string[]) {
        props.forEach(prop => {
            if (obj.hasOwnProperty(prop)) {
                avvik[prop] = obj[prop];
            }
        });
        if (obj.hasOwnProperty('loennsinntekt')) {
            const loennObj = obj['loennsinntekt'];
            if (loennObj.hasOwnProperty('beskrivelse')) {
                avvik.loennsinntektBeskrivelse = loennObj['beskrivelse'];
            }
        }
        avvik.belongsToPeriod = period;
        if (this.identificationObject) {
            avvik.ansattnummer = this.identificationObject.ansattnummer;
            avvik.foedselsdato = this.identificationObject.foedselsdato;
            avvik.ansattnavn = this.identificationObject.navn;
        }
    }

    private getAvvikWithAncestorInfoRec(obj, period: number) {
        for (const propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'yrke', 'beloep', 'fordel']);
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    const avvik = obj[propname];
                    this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'beloep', 'fordel']);
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    this.getAvvikWithAncestorInfoRec(obj[propname], period);
                }
            }
        }
    }

    private getAvvikRec(obj, period: number) {
        for (const propname in obj) {
            if (propname === 'avvik') {
                if (obj[propname] instanceof Array) {
                    obj[propname].forEach(avvik => {
                        this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'yrke', 'beloep', 'fordel']);
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    const avvik = obj[propname];
                    this.buildAvvik(obj, avvik, period, ['arbeidsforholdId', 'beloep', 'fordel']);
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    if (propname === 'inntektsmottaker') {
                        if (obj[propname].hasOwnProperty('identifiserendeInformasjon')) {
                            this.identificationObject = obj[propname]['identifiserendeInformasjon'];
                        }
                        this.getAvvikWithAncestorInfoRec(obj[propname], period);
                        this.identificationObject = {};
                    } else {
                        this.getAvvikRec(obj[propname], period);
                    }
                }
            }
        }
    }

    private groupAvvik() {
        this.periods.forEach(period => {
            const periodAvvik = {periode: period, periodeAvvik: []};
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
        const refCol = new UniTableColumn('altinnReferanse', 'Altinn referanse', UniTableColumnType.Text);
        const meldingCol = new UniTableColumn('meldingsId', 'MeldingsID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let mldID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.meldingsId === amelding.messageID) {
                        mldID = amelding.ID;
                    }
                });
                return mldID === 0 ? dataItem.meldingsId : mldID;
            });
        const statusCol = new UniTableColumn('mottakstatus', 'Status', UniTableColumnType.Text);
        const tidCol = new UniTableColumn('tidsstempelFraAltinn', 'Tid i altinn', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                return moment(dataItem.tidsstempelFraAltinn).format('DD.MM.YYYY HH:mm');
            });
        const antallCol = new UniTableColumn(
            'antallInntektsmottakere', 'Antall inntektsmottakere', UniTableColumnType.Text
        );
        const replaceCol = new UniTableColumn('erstatterMeldingsId', 'Erstatter ID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let replID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.erstatterMeldingsId === amelding.messageID) {
                        replID = amelding.ID;
                    }
                });
                return replID === 0 ? dataItem.erstatterMeldingsId : replID;
            });
        const agaCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift', 'Aga', UniTableColumnType.Money
        );
        const ftrekkCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumForskuddstrekk', 'Forskuddstrekk', UniTableColumnType.Money
        );
        const periodeCol = new UniTableColumn('periode', 'Periode', UniTableColumnType.Text);
        const financialTaxCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumFinansskattLoenn', 'Finansskatt', UniTableColumnType.Money)
            .setVisible(!!this.companySalary && this.companySalary.CalculateFinancialTax);

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig('salary.amelding.ameldingReceipt', false, false)
            .setDefaultOrderBy('meldingsId', -1)
            .setColumns([
                meldingCol, periodeCol, refCol, tidCol, statusCol, antallCol, replaceCol, agaCol, ftrekkCol, financialTaxCol
            ]);
    }
}
