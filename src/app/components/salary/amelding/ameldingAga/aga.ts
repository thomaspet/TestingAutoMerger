import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

@Component({
    selector: 'amelding-aga-view',
    templateUrl: 'app/components/salary/amelding/ameldingAga/aga.html'
})

export class AmeldingAgaView {
    @Input() public currentSumUp: any;
    private agaTableConfig: UniTableConfig;

    constructor() {
        this.setupTableConfig();
    }

    private setupTableConfig() {
        let typeCol = new UniTableColumn('type', 'Type', UniTableColumnType.Text);
        let zoneCol = new UniTableColumn('zoneName', 'Sone', UniTableColumnType.Text);
        let sectorCol = new UniTableColumn('sectorName', 'Beregningskode', UniTableColumnType.Text);
        let amountCol = new UniTableColumn('baseAmount', 'Grunnlag', UniTableColumnType.Number)
            .setWidth('6rem')
            .setCls('column-align-right');
        let rateCol = new UniTableColumn('rate', 'Sats', UniTableColumnType.Number)
            .setWidth('4rem')
            .setCls('column-align-right');

        this.agaTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([typeCol, zoneCol, sectorCol, amountCol, rateCol]);
    }
}
