import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';

@Component({
    selector: 'amelding-aga-view',
    templateUrl: './a-melding-aga-view.component.html'
})

export class AmeldingAgaViewComponent {

    @Input()
    public currentSumUp: any;

    public agaTableConfig: UniTableConfig;
    public showTable: boolean;

    constructor() {
        this.setupTableConfig();
    }

    public ngOnChanges() {
        this.showTable = this.currentSumUp
            && this.currentSumUp.agadetails
            && (this.currentSumUp.agadetails.length > 0);
    }

    private setupTableConfig() {
        const typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Text);
        const zoneCol = new UniTableColumn('zoneName', 'Sone', UniTableColumnType.Text);
        const sectorCol = new UniTableColumn('sectorName', 'Beregningskode', UniTableColumnType.Text);
        const amountCol = new UniTableColumn('baseAmount', 'Grunnlag', UniTableColumnType.Money)
            .setWidth('6rem')
            .setCls('column-align-right');
        const rateCol = new UniTableColumn('rate', 'Sats', UniTableColumnType.Money)
            .setWidth('4rem')
            .setCls('column-align-right');

        this.agaTableConfig = new UniTableConfig('salary.amelding.ameldingAga', false, true, 30)
            .setColumns([typeCol, zoneCol, sectorCol, amountCol, rateCol]);
    }
}
