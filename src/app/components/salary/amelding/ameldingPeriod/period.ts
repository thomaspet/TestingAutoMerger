import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';
import {SalaryTransactionService} from '../../../../services/services';

declare var moment;

@Component({
    selector: 'amelding-periodsummary-view',
    templateUrl: 'app/components/salary/amelding/ameldingPeriod/period.html'
})

export class AmeldingPeriodSummaryView {
    private sumGrunnlagAga: number;
    private sumCalculatedAga: number;
    private sumForskuddstrekk: number;
    private systemData: any[] = [];
    private systemTableConfig: UniTableConfig;

    private forfallsdato: string = '';
    private sumAmldAga: number = 0;
    private sumAmldFtrekk: number = 0;
    private amldData: any[] = [];
    private amldTableConfig: UniTableConfig;
    
    @Input() private currentPeriod: number;
    @Input() private currentAMelding: any;

    constructor(private _salarytransService: SalaryTransactionService) {
        this.setupSystemTableConfig();
        this.setupAmeldingTableConfig();
    }

    public ngOnChanges() {

        if (this.currentPeriod) {
            this._salarytransService.getSumsInPeriod(this.currentPeriod, this.currentPeriod, 2016)
            .subscribe((response) => {
                this.systemData = response;
                
                this.sumCalculatedAga = 0;
                this.sumForskuddstrekk = 0;
                this.sumGrunnlagAga = 0;
                
                this.systemData.forEach(dataElement => {
                    dataElement._type = 'Grunnlag';
                    this.sumCalculatedAga += dataElement.Sums.calculatedAGA;
                    this.sumGrunnlagAga += dataElement.Sums.baseAGA;
                    this.sumForskuddstrekk += dataElement.Sums.percentTax + dataElement.Sums.tableTax;
                });
            });
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
                    const pr = alleMottak.kalendermaaned;
                    const period = parseInt(pr.split('-').pop());
                    if ((period === this.currentAMelding.period) && (parseInt(pr.substring(0, pr.indexOf('-'))) === this.currentAMelding.year)) {
                        this.forfallsdato = moment(alleMottak.innbetalingsinformasjon.forfallsdato).format('DD.MM.YYYY');
                        this.checkLeveranser(alleMottak.mottattLeveranse, period);
                        this.checkMottattPeriode(alleMottak);
                    }
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
        let meldCol = new UniTableColumn('MeldingsId', 'MeldingsID', UniTableColumnType.Text);
        let ftrekkCol = new UniTableColumn('Ftrekk', 'Forskuddstrekk', UniTableColumnType.Money);
        let agaCol = new UniTableColumn('Agatrekk', 'Arbeidsgiveravgift', UniTableColumnType.Money);

        this.amldTableConfig = new UniTableConfig(false, true, 10)
        .setColumns([periodCol, meldCol, ftrekkCol, agaCol]);
    }
}
