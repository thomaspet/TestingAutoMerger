import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import { CostAllocation } from '@app/unientities';
import formFields from './cost-allocation-form.config';
import tableConfig from './cost-allocation-items-table.config';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { Subject } from 'rxjs/Subject';
import { StatisticsService } from '@app/services/common/statisticsService';
import { UniModalService } from '@uni-framework/uni-modal';
import { AccountService } from '@app/services/accounting/accountService';
import { PredefinedDescriptionService } from '@app/services/common/PredefinedDescriptionService';
import { CustomDimensionService } from '@app/services/common/customDimensionService';

@Component({
    selector: 'uni-cost-allocation-details',
    templateUrl: './cost-allocation-details.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `:host {width: 100%;}`,
        `section.uni-container { width: 100%; }`
    ]
})
export class UniCostAllocationDetails {
    @Input() costAllocation: CostAllocation = new CostAllocation();
    @Input() isTouched: boolean;

    @Output() touched = new EventEmitter<boolean>(true);

    @ViewChild(AgGridWrapper) table: AgGridWrapper;
    formConfig = { autofocus: true };
    formFields = formFields;
    tableConfig: UniTableConfig;
    _onDestroy = new Subject();
    constructor(
        private companySettingsService: CompanySettingsService,
        private vatTypeService: VatTypeService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private predefinedDescriptionService: PredefinedDescriptionService,
        private customDimensionService: CustomDimensionService) {

    }

    ngOnInit() {
        tableConfig(
            this.table,
            this.companySettingsService,
            this.vatTypeService,
            this.accountService,
            this.statisticsService,
            this.modalService,
            this.predefinedDescriptionService,
            this.customDimensionService
        )
            .takeUntil(this._onDestroy)
            .subscribe(config => {
                this.tableConfig = config;
                this.tableConfig.deleteButton = true;
            });
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.costAllocation) {
            this.costAllocation = change.costAllocation.currentValue;
        }
    }

    ngOnDestroy() {
        this._onDestroy.next();
    }

    onFormInput() {
        this.touched.emit(true);
    }

    onRowDeleted() {
        this.touched.emit(true);
    }

    onRowChange() {
        this.touched.emit(true);
    }
}
