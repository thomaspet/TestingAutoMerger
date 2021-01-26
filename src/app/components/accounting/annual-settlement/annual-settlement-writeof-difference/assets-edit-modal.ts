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
        this.groups = [...this.options.data.groups.sort((a, b) => { return a.GroupCode > b.GroupCode ? 1 : -1 })].map(item => {
            item.Deleted = item.PurchaseYear === 2020;
            return item;
        });
        this.setUpTable();
        this.busy = false;
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

        if (!this.groups.filter(group => group._isDirty)?.length) {
            this.close();
        }

        this.busy = true;

        this.annualSettlementService.updateTaxbasedIB(this.groups).subscribe((updatedGroups) => {
            this.busy = false;
            this.groups = updatedGroups;
            this.onClose.emit(true);
        }, err => {
            this.errorService.handle(err);
            this.busy = false;
        });
    }

    close() {
        this.onClose.emit(false);
    }
}
