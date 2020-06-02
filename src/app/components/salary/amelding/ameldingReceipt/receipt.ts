import {Component, Input} from '@angular/core';
import * as moment from 'moment';
import { AmeldingData, CompanySalary } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AMeldingService } from '@app/components/salary/amelding/shared/service/aMeldingService';

@Component({
    selector: 'amelding-receipt-view',
    templateUrl: './receipt.html'
})

export class AmeldingReceiptView {
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    @Input() public companySalary: CompanySalary;
    public mottattLeveranserIPerioden: any[] = [];
    private alleAvvikNoder: any[] = [];
    public allAvvikGroupedByPeriod: any[] = [];
    public mottattLeveranserIPeriodenConfig: UniTableConfig;
    private periods: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    private identificationObject: any = {};
    public isRejected: boolean = false;

    constructor(
        private _ameldingService: AMeldingService
    ) {
    }

    public ngOnChanges() {
        this.setupMottakTable();
        if (this.currentAMelding) {
            if (this.currentAMelding.hasOwnProperty('feedBack')) {
                const feedback = this.currentAMelding.feedBack;
                if (feedback !== null) {
                    this.allAvvikGroupedByPeriod = [];
                    this.alleAvvikNoder = this._ameldingService.getAvvikIAmeldingen(this.currentAMelding);
                    this._ameldingService
                        .attachMessageIDsToLeveranser(this._ameldingService.getLeveranserIAmeldingen(), this.aMeldingerInPeriod)
                        .subscribe(leveranser => this.mottattLeveranserIPerioden = leveranser);
                    this.groupAvvik();
                }
            }
        }
    }

    public rowSelected(event) {

    }

    public toggleCollapsed(index: number) {
        this.alleAvvikNoder[index].collapsed = !this.alleAvvikNoder[index].collapsed;
    }

    private groupAvvik() {
        this.periods.forEach(period => {
            const periodAvvik = {periode: period, periodeAvvik: []};
            this.alleAvvikNoder.forEach(avvik => {
                if (period === avvik.belongsToPeriod) {
                    periodAvvik.periodeAvvik.push(avvik);
                    this.isRejected = avvik['alvorlighetsgrad'] === 'avvisning';
                }
            });
            if (periodAvvik.periodeAvvik.length) {
                this.allAvvikGroupedByPeriod.push(periodAvvik);
            }
        });
    }

    private setupMottakTable() {
        const refCol = new UniTableColumn('altinnReferanse', 'Altinn referanse', UniTableColumnType.Text);
        const meldingCol = new UniTableColumn('_messageID', 'MeldingsID', UniTableColumnType.Text);
        const meldingRefCol = new UniTableColumn('meldingsId', 'Altinn meldingsid', UniTableColumnType.Text)
            .setVisible(false);
        const statusCol = new UniTableColumn('mottakstatus', 'Status', UniTableColumnType.Text);
        const tidCol = new UniTableColumn('tidsstempelFraAltinn', 'Tid i altinn', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                return moment(dataItem.tidsstempelFraAltinn).format('DD.MM.YYYY HH:mm');
            });
        const antallCol = new UniTableColumn(
            'antallInntektsmottakere', 'Antall inntektsmottakere', UniTableColumnType.Text
        );
        const replaceCol = new UniTableColumn('_replaceMessageID', 'Erstatter ID', UniTableColumnType.Text);
        const agaCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift', 'Aga', UniTableColumnType.Money
        );
        const ftrekkCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumForskuddstrekk', 'Forskuddstrekk', UniTableColumnType.Money
        );
        const periodeCol = new UniTableColumn('periode', 'Periode', UniTableColumnType.Text);
        const financialTaxCol = new UniTableColumn(
            'mottattAvgiftOgTrekkTotalt.sumFinansskattLoenn', 'Finansskatt', UniTableColumnType.Money);

        const columns: UniTableColumn[] = [
            meldingCol, meldingRefCol, periodeCol, refCol, tidCol, statusCol, antallCol, replaceCol, agaCol, ftrekkCol
        ];
        if (this.companySalary && this.companySalary.CalculateFinancialTax) {
            columns.push(financialTaxCol);
        }

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig('salary.amelding.ameldingReceipt', false, false)
            .setDefaultOrderBy('meldingsId', -1)
            .setColumns(columns);
    }
}
