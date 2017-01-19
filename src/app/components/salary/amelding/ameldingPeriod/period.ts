import { NumberFormat } from './../../../../services/services';
import { Component, Input } from '@angular/core';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from 'unitable-ng2/main';
import { AmeldingData } from '../../../../unientities';
import { ISummaryConfig } from '../../../common/summary/summary';
import * as moment from 'moment';

@Component({
    selector: 'amelding-periodsummary-view',
    templateUrl: './period.html'
})

export class AmeldingPeriodSummaryView {
    private sumGrunnlagAga: number;
    private sumCalculatedAga: number;
    private sumForskuddstrekk: number;
    private systemTableConfig: UniTableConfig;

    private forfallsdato: string = '';
    private sumAmldAga: number = 0;
    private sumAmldFtrekk: number = 0;
    private amldData: any[] = [];
    private amldTableConfig: UniTableConfig;

    private systemPeriodSums: ISummaryConfig[] = [];
    private ameldingPeriodSums: ISummaryConfig[] = [];

    @Input() private systemData: any[] = [];
    @Input() private currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];

    constructor(private numberFormat: NumberFormat) {
        this.setupSystemTableConfig();
        this.setupAmeldingTableConfig();
    }

    public ngOnChanges() {

        if (this.systemData) {
            this.sumGrunnlagAga = 0;
            this.sumCalculatedAga = 0;
            this.sumForskuddstrekk = 0;

            this.systemData.forEach(dataElement => {
                dataElement._type = 'Grunnlag';
                this.sumGrunnlagAga += dataElement.Sums.baseAGA;
                this.sumCalculatedAga += dataElement.Sums.calculatedAGA;
                this.sumForskuddstrekk += dataElement.Sums.percentTax + dataElement.Sums.tableTax;
            });

            this.systemPeriodSums = [
                {
                    title: 'Grunnlag aga',
                    value: this.numberFormat.asMoney(this.sumGrunnlagAga, {decimalLength: 0})
                }, {
                    title: 'Sum aga',
                    value: this.numberFormat.asMoney(this.sumCalculatedAga, {decimalLength: 0})
                }, {
                    title: 'Sum forskuddstrekk',
                    value: this.numberFormat.asMoney(this.sumForskuddstrekk, {decimalLength: 0})
                }
            ];
        }

        if (this.currentAMelding) {
            this.getAmeldingData();
        }
    }

    private getAmeldingData() {
        if (this.currentAMelding.hasOwnProperty('feedBack')) {
            if (this.currentAMelding.feedBack !== null) {
                let alleMottak = this.currentAMelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        if ((period === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                            this.forfallsdato = moment(mottak.innbetalingsinformasjon.forfallsdato).format('DD.MM.YYYY');
                            this.checkLeveranser(mottak.mottattLeveranse, period);
                            this.checkMottattPeriode(mottak);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop());
                        if ((period === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                            this.forfallsdato = moment(alleMottak.innbetalingsinformasjon.forfallsdato).format('DD.MM.YYYY');
                            this.checkLeveranser(alleMottak.mottattLeveranse, period);
                            this.checkMottattPeriode(alleMottak);
                        }
                    }
                }

                this.ameldingPeriodSums = [{
                    title: 'Forfallsdato',
                    value: this.forfallsdato
                }, {
                    title: 'Sum aga',
                    value: this.sumAmldAga ? this.numberFormat.asMoney(this.sumAmldAga, {decimalLength: 0}) : null
                }, {
                    title: 'Sum forskuddstrekk',
                    value: this.sumAmldFtrekk ? this.numberFormat.asMoney(this.sumAmldFtrekk, {decimalLength: 0}) : null
                }];
            }
        }
    }

    private checkLeveranser(leveranser, periode) {
        if (leveranser instanceof Array) {
            leveranser.forEach(leveranse => {
                this.checkAvgiftOgTrekk(leveranse, periode);
            });
        } else {
            this.checkAvgiftOgTrekk(leveranser, periode);
        }
    }

    private checkMottattPeriode(mottak) {
        if (mottak.hasOwnProperty('mottattPeriode')) {
            if (mottak.mottattPeriode.hasOwnProperty('mottattAvgiftOgTrekkTotalt')) {
                this.sumAmldAga = mottak.mottattPeriode.mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift;
                this.sumAmldFtrekk = mottak.mottattPeriode.mottattAvgiftOgTrekkTotalt.sumForskuddstrekk;
            }
        }
    }

    private checkAvgiftOgTrekk(leveranse, periode) {
        let amldObj: any = {};
        amldObj.Periode = periode;
        amldObj.MeldingsId = leveranse.meldingsId;
        if (leveranse.hasOwnProperty('mottattAvgiftOgTrekkTotalt')) {
            amldObj.Ftrekk = leveranse.mottattAvgiftOgTrekkTotalt.sumForskuddstrekk;
            amldObj.Agatrekk = leveranse.mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift;
        } else {
            amldObj.Ftrekk = '0';
            amldObj.Agatrekk = '0';
        }
        this.amldData.push(amldObj);
    }

    private setupSystemTableConfig() {
        let orgnrCol = new UniTableColumn('OrgNumber', 'Org.nr.', UniTableColumnType.Text).setWidth('7rem');
        let soneCol = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text).setWidth('4rem');
        let municipalCol = new UniTableColumn('MunicipalName', 'Kommune', UniTableColumnType.Text);
        let typeCol = new UniTableColumn('_type', 'Type', UniTableColumnType.Number).setWidth('7rem');
        let rateCol = new UniTableColumn('AgaRate', 'Sats', UniTableColumnType.Number)
            .setWidth('4rem')
            .setCls('column-align-right');
        let amountCol = new UniTableColumn('Sums.baseAGA', 'Grunnlag', UniTableColumnType.Money).setWidth('7rem');
        let agaCol = new UniTableColumn('Sums.calculatedAGA', 'Aga', UniTableColumnType.Money).setWidth('7rem');

        this.systemTableConfig = new UniTableConfig(false, true, 10)
            .setColumns([orgnrCol, soneCol, municipalCol, typeCol, rateCol, amountCol, agaCol]);
    }

    private setupAmeldingTableConfig() {
        let periodCol = new UniTableColumn('Periode', 'Periode', UniTableColumnType.Text);
        let meldCol = new UniTableColumn('MeldingsId', 'MeldingsID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let mldID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.MeldingsId === amelding.messageID) {
                        mldID = amelding.ID;
                    }
                });
                return mldID === 0 ? dataItem.MeldingsId : mldID;
            });
        let ftrekkCol = new UniTableColumn('Ftrekk', 'Forskuddstrekk', UniTableColumnType.Money);
        let agaCol = new UniTableColumn('Agatrekk', 'Arbeidsgiveravgift', UniTableColumnType.Money);

        this.amldTableConfig = new UniTableConfig(false, true, 10)
            .setColumns([periodCol, meldCol, ftrekkCol, agaCol]);
    }
}
