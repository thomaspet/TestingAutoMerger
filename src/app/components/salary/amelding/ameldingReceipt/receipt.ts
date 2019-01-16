import {Component, Input} from '@angular/core';
import {
    UniTableConfig,
    UniTableColumnType,
    UniTableColumn,
} from '../../../../../framework/ui/unitable/index';
import {AmeldingData, CompanySalary} from '../../../../unientities';
import * as moment from 'moment';
import { AMeldingService} from '../../../../services/services';

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

    constructor(
        private _ameldingService: AMeldingService
    ) {
    }

    public ngOnChanges() {
        this.showFeedback = false;
        this.setupMottakTable();
        if (this.currentAMelding) {
            if (this.currentAMelding.hasOwnProperty('feedBack')) {
                const feedback = this.currentAMelding.feedBack;
                if (feedback !== null) {
                    this. alleAvvikNoder = this._ameldingService.getAvvikIAmeldingen(this.currentAMelding);
                    this.mottattLeveranserIPerioden = this._ameldingService.getLeveranserIAmeldingen();
                    this.groupAvvik();
                    this.showFeedback = true;
                } else {
                    this.showFeedback = false;
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
            'mottattAvgiftOgTrekkTotalt.sumFinansskattLoenn', 'Finansskatt', UniTableColumnType.Money);

        const columns: UniTableColumn[] = [
            meldingCol, periodeCol, refCol, tidCol, statusCol, antallCol, replaceCol, agaCol, ftrekkCol
        ];
        if (this.companySalary && this.companySalary.CalculateFinancialTax) {
            columns.push(financialTaxCol);
        }

        this.mottattLeveranserIPeriodenConfig = new UniTableConfig('salary.amelding.ameldingReceipt', false, false)
            .setDefaultOrderBy('meldingsId', -1)
            .setColumns(columns);
    }
}
