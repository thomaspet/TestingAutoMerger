import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumn, UniTableColumnType} from 'unitable-ng2/main';
import {SalaryTransactionService} from '../../../../services/services';

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
    @Input() private currentPeriod: number; 

    constructor(private _salarytransService: SalaryTransactionService) {
        this.setupSystemTableConfig();
    }

    public ngAfterViewInit() {
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
    }

    private setupSystemTableConfig() {
        let orgnrCol = new UniTableColumn('OrgNumber', 'Org.nr.', UniTableColumnType.Text);
        let soneCol = new UniTableColumn('AgaZone', 'Sone', UniTableColumnType.Text).setWidth('4rem');
        let municipalCol = new UniTableColumn('MunicipalName', 'Kommune', UniTableColumnType.Text);
        let typeCol = new UniTableColumn('_type', 'Type', UniTableColumnType.Number);
        let rateCol = new UniTableColumn('AgaRate', 'Sats', UniTableColumnType.Number)
            .setWidth('4rem')
            .setCls('column-align-right');
        let amountCol = new UniTableColumn('Sums.baseAGA', 'Grunnlag', UniTableColumnType.Money);
        let agaCol = new UniTableColumn('Sums.calculatedAGA', 'Aga', UniTableColumnType.Money);

        this.systemTableConfig = new UniTableConfig(false, true, 10)
        .setColumns([orgnrCol, soneCol, municipalCol, typeCol, rateCol, amountCol, agaCol]);
    }
}
