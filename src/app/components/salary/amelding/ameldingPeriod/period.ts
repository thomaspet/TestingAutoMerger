import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable';
import {AmeldingData, CompanySalary} from '@uni-entities';
import {ISummaryConfig} from '../../../common/summary/summary';
import * as moment from 'moment';
import { ITaxAndAgaSums, ISystemTaxAndAgaSums, SalarySumsService } from '@app/components/salary/shared/services/salary-transaction/salarySumsService';
import { NumberFormat } from '@app/services/services';

@Component({
    selector: 'amelding-periodsummary-view',
    templateUrl: './period.html'
})
export class AmeldingPeriodSummaryView {
    @Input() public systemData: ITaxAndAgaSums;
    @Input() public currentAMelding: any;
    @Input() public aMeldingerInPeriod: AmeldingData[];
    @Input() public companySalary: CompanySalary;

    public systemSource: ISystemTaxAndAgaSums[] = [];
    private sumGrunnlagAga: number;
    private sumCalculatedAga: number;
    private sumForskuddstrekk: number;
    private sumFinansskattLoenn: number;
    public systemTableConfig: UniTableConfig;

    private forfallsdato: string = '';
    private sumAmldAga: number = 0;
    private sumAmldFtrekk: number = 0;
    private sumAmldFinansskattLoenn: number = 0;
    public amldData: any[] = [];
    public amldTableConfig: UniTableConfig;

    public systemPeriodSums: ISummaryConfig[] = [];
    public ameldingPeriodSums: ISummaryConfig[] = [];

    public collapsePaymentInfo: boolean = false;
    public kidAGA: string;
    public kidTrekk: string;
    public kidFinancial: string;
    public accountNumber: string;

    constructor(
        private numberFormat: NumberFormat,
        private sumService: SalarySumsService,
    ) {
        this.setupSystemTableConfig();
        this.setupAmeldingTableConfig();
    }

    public ngOnChanges() {

        if (this.systemData) {
            this.sumGrunnlagAga = 0;
            this.sumCalculatedAga = 0;
            this.sumForskuddstrekk = 0;
            this.sumFinansskattLoenn = 0;

            this.sumGrunnlagAga = this.sumService.getAgaBase(this.systemData.Aga);
            this.sumCalculatedAga = this.sumService.getAgaSum(this.systemData.Aga);
            this.sumForskuddstrekk = this.systemData.WithholdingTax;
            this.sumFinansskattLoenn = this.systemData.FinancialTax;

            this.systemSource = this.sumService.getAgaList(this.systemData.Aga);

            this.systemPeriodSums = [
                {
                    title: 'Grunnlag aga',
                    value: this.numberFormat.asMoney(this.sumGrunnlagAga, {decimalLength: 0})
                },
                {
                    title: 'Sum aga',
                    value: this.numberFormat.asMoney(this.sumCalculatedAga, {decimalLength: 0})
                },
                {
                    title: 'Sum forskuddstrekk',
                    value: this.numberFormat.asMoney(this.sumForskuddstrekk, {decimalLength: 0})
                }
            ];
            if (this.companySalary && this.companySalary.CalculateFinancialTax) {
                this.systemPeriodSums.push(
                    {
                        title: 'Sum finansskatt',
                        value: this.numberFormat.asMoney(this.sumFinansskattLoenn, {decimalLength: 0})
                    }
                );
            }
        }

        if (this.currentAMelding) {
            this.getAmeldingData();
        }
    }

    private getAmeldingData() {
        if (this.currentAMelding.hasOwnProperty('feedBack')) {
            if (this.currentAMelding.feedBack !== null) {
                const alleMottak = this.currentAMelding.feedBack.melding.Mottak;
                if (alleMottak instanceof Array) {
                    alleMottak.forEach(mottak => {
                        const pr = mottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        if ((period === this.currentAMelding.period)
                            && (parseInt(pr.substring(0, pr.indexOf('-')), 10)
                            === this.currentAMelding.year)) {
                                this.forfallsdato = moment(
                                    mottak.innbetalingsinformasjon.forfallsdato).format('DD.MM.YYYY'
                                );
                                this.checkLeveranser(mottak.mottattLeveranse, period);
                                this.checkMottattPeriode(mottak);
                                this.checkInnbetalingsinformsajon(mottak);
                        }
                    });
                } else {
                    if (alleMottak.hasOwnProperty('kalendermaaned')) {
                        const pr = alleMottak.kalendermaaned;
                        const period = parseInt(pr.split('-').pop(), 10);
                        if ((period === this.currentAMelding.period)
                            && (parseInt(pr.substring(0, pr.indexOf('-')), 10) === this.currentAMelding.year)) {
                                this.forfallsdato = moment(
                                    alleMottak.innbetalingsinformasjon.forfallsdato).format('DD.MM.YYYY'
                                );
                                this.checkLeveranser(alleMottak.mottattLeveranse, period);
                                this.checkMottattPeriode(alleMottak);
                                this.checkInnbetalingsinformsajon(alleMottak);
                        }
                    }
                }

                this.ameldingPeriodSums = [
                    {
                        title: 'Forfallsdato',
                        value: this.forfallsdato
                    },
                    {
                        title: 'Sum aga',
                        value: this.numberFormat.asMoney(this.sumAmldAga || 0, {decimalLength: 0})
                    },
                    {
                        title: 'Sum forskuddstrekk',
                        value: this.numberFormat.asMoney(this.sumAmldFtrekk || 0, {decimalLength: 0})
                    }
                ];
                if (this.companySalary && this.companySalary.CalculateFinancialTax) {
                    this.ameldingPeriodSums.push(
                        {
                            title: 'Sum finansskatt',
                            value: this.numberFormat.asMoney(this.sumAmldFinansskattLoenn || 0, {decimalLength: 0})
                        }
                    );
                }
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
            if (!!mottak.mottattPeriode && mottak.mottattPeriode.hasOwnProperty('mottattAvgiftOgTrekkTotalt')) {
                this.sumAmldAga = mottak.mottattPeriode.mottattAvgiftOgTrekkTotalt.sumArbeidsgiveravgift;
                this.sumAmldFtrekk = mottak.mottattPeriode.mottattAvgiftOgTrekkTotalt.sumForskuddstrekk;
                this.sumAmldFinansskattLoenn = mottak.mottattPeriode.mottattAvgiftOgTrekkTotalt.sumFinansskattLoenn;
            }
        }
    }

    private checkInnbetalingsinformsajon(mottak) {
        if (mottak.hasOwnProperty('innbetalingsinformasjon')) {
            if (!!mottak.innbetalingsinformasjon) {
                if (mottak.innbetalingsinformasjon.hasOwnProperty('kidForArbeidsgiveravgift')) {
                    this.kidAGA = mottak.innbetalingsinformasjon.kidForArbeidsgiveravgift;
                }
                if (mottak.innbetalingsinformasjon.hasOwnProperty('kidForForskuddstrekk')) {
                    this.kidTrekk = mottak.innbetalingsinformasjon.kidForForskuddstrekk;
                }
                if (mottak.innbetalingsinformasjon.hasOwnProperty('kidForFinansskattLoenn')) {
                    this.kidFinancial = mottak.innbetalingsinformasjon.kidForFinansskattLoenn;
                }
                if (mottak.innbetalingsinformasjon.hasOwnProperty('kontonummer')) {
                    this.accountNumber = mottak.innbetalingsinformasjon.kontonummer;
                }
            }
        }
    }

    private checkAvgiftOgTrekk(leveranse, periode) {
        const amldObj: any = {};
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
        const orgnrCol = new UniTableColumn('orgNumber', 'Org.nr.', UniTableColumnType.Text).setWidth('7rem');
        const soneCol = new UniTableColumn('zone', 'Sone', UniTableColumnType.Text).setWidth('4rem');
        const municipalCol = new UniTableColumn('municipality', 'Kommune', UniTableColumnType.Text);
        const typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Number).setWidth('7rem');
        const rateCol = new UniTableColumn('rate', 'Sats', UniTableColumnType.Number).setWidth('4rem');
        const amountCol = new UniTableColumn('base', 'Grunnlag', UniTableColumnType.Money).setWidth('7rem');
        const agaCol = new UniTableColumn('aga', 'Aga', UniTableColumnType.Money).setWidth('7rem');

        this.systemTableConfig = new UniTableConfig('salary.amelding.ameldingPeriod.system', false, true, 10)
            .setColumns([orgnrCol, soneCol, municipalCol, typeCol, rateCol, amountCol, agaCol]);
    }

    private setupAmeldingTableConfig() {
        const periodCol = new UniTableColumn('Periode', 'Periode', UniTableColumnType.Text);
        const meldCol = new UniTableColumn('MeldingsId', 'MeldingsID', UniTableColumnType.Text)
            .setTemplate((dataItem) => {
                let mldID = 0;
                this.aMeldingerInPeriod.forEach(amelding => {
                    if (dataItem.MeldingsId === amelding.messageID) {
                        mldID = amelding.ID;
                    }
                });
                return mldID === 0 ? dataItem.MeldingsId : mldID;
            });
        const ftrekkCol = new UniTableColumn('Ftrekk', 'Forskuddstrekk', UniTableColumnType.Money);
        const agaCol = new UniTableColumn('Agatrekk', 'Arbeidsgiveravgift', UniTableColumnType.Money);

        this.amldTableConfig = new UniTableConfig('salary.amelding.ameldingPeriod.period', false, true, 10)
            .setColumns([periodCol, meldCol, ftrekkCol, agaCol]);
    }
}
