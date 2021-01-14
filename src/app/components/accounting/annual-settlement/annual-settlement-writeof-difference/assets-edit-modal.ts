import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ErrorService} from '@app/services/services';
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { AnnualSettlementService } from '../annual-settlement.service';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';

@Component({
    selector: 'assets-edit-modal',
    templateUrl: './assets-edit-modal.html',
    styleUrls: ['./assets-edit-modal.sass']
})
export class AssetsEditModal implements IUniModal {
    
    @ViewChild(AgGridWrapper, { static: false })
    private table: AgGridWrapper;
    
    @Input() 
    options: IModalOptions = {};
    
    @Output() 
    onClose = new EventEmitter();

    busy: boolean = true;
    tableConfig: UniTableConfig;
    groups = [];

    constructor(
        private errorService: ErrorService,
        private annualSettlementService: AnnualSettlementService,
    ) {}

    ngOnInit() {
        this.annualSettlementService.getAssetAndGroups(this.options.data.ID).subscribe(groups => {
            this.groups = groups.sort((a, b) => { return a.GroupCode > b.GroupCode ? 1 : -1 });
            console.log(groups);
            this.setUpTable();
            this.busy = false;
        });
    }

    setUpTable() {
        this.tableConfig = new UniTableConfig('acconting.annualsettlement.editassetsmodal', true, false, 20)
        .setAutoAddNewRow(false)
        .setColumns([
            new UniTableColumn('GroupCode', 'Saldogruppe', UniTableColumnType.Text).setEditable(false),
            new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setEditable(false),
            new UniTableColumn('Value', 'Saldogrunnlag 01.01.2020', UniTableColumnType.Money)
        ]);
    }

    save() {
        this.table.finishEdit();
        console.log(this.groups);
        const linesToSave = this.groups.filter(group => group._isDirty);

        if (!linesToSave.length) {
            this.onClose.emit(false);
        }

        this.busy = true;

        const queries = [];

        linesToSave.forEach(line => {
            queries.push(this.annualSettlementService.updateTaxbasedIB(line));
        })

        Observable.forkJoin(queries).subscribe(() => {
            this.busy = false;
            this.onClose.emit(true);
        });
    }

    close() {
        this.onClose.emit(false);
    }
}
