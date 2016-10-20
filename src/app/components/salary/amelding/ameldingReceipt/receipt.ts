import {Component, Input, ViewChildren, QueryList} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {AMeldingService} from '../../../../services/Salary/AMelding/AMeldingService';
import {AmeldingData} from '../../../../unientities';

@Component({
    selector: 'amelding-receipt-view',
    templateUrl: 'app/components/salary/amelding/ameldingReceipt/receipt.html'
})

export class AmeldingReceiptView {
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    @ViewChildren(UniTable) private tableElements: QueryList<UniTable>;
    private tables: any[];
    private mottattLeveranserIPerioden: any[] = [];
    private alleAvvik: any[] = [];
    private alleAvvikNoder: NodeListOf<any>;
    private mottattLeveranserIPeriodenConfig: UniTableConfig;
    private avvikConfig: UniTableConfig;

    private showFeedback: boolean;
    private selectedInnsending: any;

    constructor(private _ameldService: AMeldingService) {
        this.setupMottakTable();
        this.setupAvvikTable();
    }

    public ngOnChanges() {
        this.showFeedback = false;
        if (this.currentAMelding) {
            this._ameldService.getAMeldingWithFeedback(this.currentAMelding.ID)
            .subscribe((ameld) => {
                this.currentAMelding = ameld;
                this.getAlleAvvik();
                this.showFeedback = this.currentAMelding.feedBack === null ? false : true;
                if (this.showFeedback) {
                    // console.log('Amelding med feedback', this.currentAMelding);
                    let motak = this.currentAMelding.feedBack.melding.Mottak;
                    if (motak instanceof Array) {
                        this.currentAMelding.feedBack.melding.Mottak.forEach(mottak => {
                            const pr = mottak.kalendermaaned;
                            if ((parseInt(pr.split('-').pop()) === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                                this.checkMottattLeveranse(mottak.mottattLeveranse);
                            }
                        });
                    } else {
                        this.checkMottattLeveranse(motak.mottattLeveranse);
                    }
                    
                }
            });
        }
    }

    public ngAfterViewInit() {
        this.tables = this.tableElements.toArray();
        this.setFocusToLast();
    }

    public rowSelected(event) {
        this.selectedInnsending = event.rowModel;
        if (event.rowModel.hasOwnProperty('avvik')) {
            this.updateAndShowAvvik(event.rowModel.avvik);
        } else {
            this.alleAvvik = [];
        }
    }

    public toggleCollapsed(index: number) {
        this.alleAvvik[index].collapsed = !this.alleAvvik[index].collapsed;
    }

    private checkMottattLeveranse(leveranser) {
        if (leveranser instanceof Array) {
            leveranser.forEach(leveranse => {
                this.mottattLeveranserIPerioden.push(leveranse);
                if (leveranse.hasOwnProperty('avvik')) {
                    this.updateAndShowAvvik(leveranse.avvik);
                }
            });
        } else {
            this.mottattLeveranserIPerioden.push(leveranser);
        }
    }

    private getAlleAvvik() {
        // TODO: find and list all "avvik"
        // console.log('alleAvvikNoder', this.alleAvvikNoder);
    }

    private setFocusToLast() {
        // console.log('setfocustolast', this.mottattLeveranserIPerioden);
        if (this.mottattLeveranserIPerioden.length > 0) {
            this.tables[0].focusRow(this.mottattLeveranserIPerioden.length - 1);
        }
    }

    private updateAndShowAvvik(alleAvvik: any[]) {
        this.alleAvvik = [];
        alleAvvik.forEach(avvik => {
            this.alleAvvik.push(avvik);
        });
    }

    private setupMottakTable() {
        let refCol = new UniTableColumn('altinnReferanse', 'Altinn referanse', UniTableColumnType.Text);
        let kildeCol = new UniTableColumn('kildesystem', 'Kilde', UniTableColumnType.Text);
        let meldingCol = new UniTableColumn('meldingsId', 'MeldingsID', UniTableColumnType.Text).setWidth('7rem')
            .setTemplate((dataItem) => {
                let mldID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.meldingsId === amelding.messageID) {
                        mldID = amelding.ID;
                    } 
                });
                return mldID === 0 ? dataItem.meldingsId : mldID;
            });
        let statusCol = new UniTableColumn('mottakstatus', 'Status', UniTableColumnType.Text).setWidth('5rem');
        let tidCol = new UniTableColumn('tidsstempelFraAltinn', 'Tid i altinn', UniTableColumnType.Date);
        let antallCol = new UniTableColumn('antallInntektsmottakere', 'Ant. inntektsmottakere', UniTableColumnType.Text).setWidth('12rem');
        let leveringCol = new UniTableColumn('leveringstidspunkt', 'Leveringstidspunkt', UniTableColumnType.Date).setWidth('10rem');

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig(false, true, 15)
        .setColumns([refCol, kildeCol, meldingCol, statusCol, tidCol, antallCol, leveringCol]);
    }

    private setupAvvikTable() {
        let refCol = new UniTableColumn('altinnReferanse', 'Altinn referanse', UniTableColumnType.Text);
        let kildeCol = new UniTableColumn('kildesystem', 'Kilde', UniTableColumnType.Text);
        let meldingCol = new UniTableColumn('meldingsId', 'MeldingsID', UniTableColumnType.Text);
        let statusCol = new UniTableColumn('mottakstatus', 'Status', UniTableColumnType.Text);
        let tidCol = new UniTableColumn('tidsstempelFraAltinn', 'Tid i altinn', UniTableColumnType.Date);

        this.avvikConfig = new UniTableConfig(false, true, 15)
        .setColumns([refCol, kildeCol, meldingCol, statusCol, tidCol]);
    }
}
