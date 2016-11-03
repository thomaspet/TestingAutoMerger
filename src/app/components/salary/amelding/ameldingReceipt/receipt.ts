import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {AmeldingData} from '../../../../unientities';

declare var moment;

@Component({
    selector: 'amelding-receipt-view',
    templateUrl: 'app/components/salary/amelding/ameldingReceipt/receipt.html'
})

export class AmeldingReceiptView {
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    private mottattLeveranserIPerioden: any[] = [];
    private alleAvvikNoder: any[] = [];
    private mottattLeveranserIPeriodenConfig: UniTableConfig;
    private showFeedback: boolean;

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

    private setMottattLeveranser(leveranser) {
        if (leveranser instanceof Array) {
            leveranser.forEach(leveranse => {
                this.mottattLeveranserIPerioden.push(leveranse);
            });
        } else {
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
                        this.setMottattLeveranser(mottak.mottattLeveranse);
                        const pr = mottak.kalendermaaned;
                        if ((parseInt(pr.split('-').pop()) === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                            this.getAvvikRec(mottak);
                        }
                    });
                } else {
                    this.setMottattLeveranser(alleMottak.mottattLeveranse);
                    const pr = alleMottak.kalendermaaned;
                    if ((parseInt(pr.split('-').pop()) === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                        this.getAvvikRec(alleMottak);
                    }
                }
                this.showFeedback = true;
            } else {
                this.showFeedback = false;
            }
        }
    }

    private getAvvikRec(obj) {
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
                        this.alleAvvikNoder.push(avvik);
                    });
                } else {
                    let avvik = obj[propname];
                    if (obj.hasOwnProperty('arbeidsforholdId')) {
                        avvik.arbeidsforholdId = obj['arbeidsforholdId'];
                    }
                    this.alleAvvikNoder.push(avvik);
                }
            } else {
                if (typeof obj[propname] === 'object' && obj[propname] !== null) {
                    this.getAvvikRec(obj[propname]);
                }
            }
        }
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
        let replaceCol = new UniTableColumn('erstatterMeldingsId', 'Erstatter ID', UniTableColumnType.Number);
        let agaCol = new UniTableColumn('mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift', 'Aga', UniTableColumnType.Money);
        let ftrekkCol = new UniTableColumn('mottattAvgiftOgTrekkTotalt.sumForskuddstrekk', 'Forskuddstrekk', UniTableColumnType.Money);

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig(false, true, 15)
        .setColumns([meldingCol, refCol, tidCol, statusCol, antallCol, replaceCol, agaCol, ftrekkCol]);
    }
}
