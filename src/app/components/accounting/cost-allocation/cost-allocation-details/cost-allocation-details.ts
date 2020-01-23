import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { UniTableConfig } from '@uni-framework/ui/unitable';
import { CompanySettings, CostAllocation } from '@app/unientities';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { StatisticsService } from '@app/services/common/statisticsService';
import { UniModalService } from '@uni-framework/uni-modal';
import { AccountService } from '@app/services/accounting/accountService';
import { PredefinedDescriptionService } from '@app/services/common/PredefinedDescriptionService';
import { CustomDimensionService } from '@app/services/common/customDimensionService';
import { forkJoin } from 'rxjs';
import { accountColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/account.column';
import { customDimensionColumns } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/custom-dimension.column';
import { vattypeColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/vattype.column';
import { ammountColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/amount.column';
import { descriptionColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/description.column';
import { departmentColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/department.column';
import { projectColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/project.column';
import { FieldType } from '@uni-framework/ui/uniform';
import { percentColumn } from '@app/components/accounting/cost-allocation/cost-allocation-details/columns/percent.column';

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
    @Output() touched = new EventEmitter<boolean>(true);
    @ViewChild(AgGridWrapper, { static: true }) table: AgGridWrapper;
    formConfig = { autofocus: true };
    formFields = [
        {
            EntityType: 'CostAllocation',
            Property: 'Name',
            FieldType: FieldType.TEXT,
            Label: 'Navn',
            Section: 0,
            FieldSet: 0
        }
    ];
    tableConfig: UniTableConfig;
    constructor(
        private cdr: ChangeDetectorRef,
        private companySettingsService: CompanySettingsService,
        private vatTypeService: VatTypeService,
        private accountService: AccountService,
        private statisticsService: StatisticsService,
        private modalService: UniModalService,
        private predefinedDescriptionService: PredefinedDescriptionService,
        private customDimensionService: CustomDimensionService) {

    }

    ngOnInit() {
        forkJoin([
            this.companySettingsService.Get(1),
            this.predefinedDescriptionService.GetAll('filter=Type eq 1'),
            this.customDimensionService.getMetadata(),
            this.vatTypeService.GetAll('orderby=VatCode')
        ]).subscribe(([companySettings, descriptions, dimensionsMetadata, vattypes]) => {
            const dimensionColumns = customDimensionColumns(
                this.customDimensionService,
                dimensionsMetadata
            );
            const columns = [
                accountColumn(this.table, this.accountService, this.modalService),
                vattypeColumn(vattypes, <CompanySettings>companySettings),
                ammountColumn(),
                percentColumn(),
                descriptionColumn(descriptions),
                departmentColumn(this.statisticsService),
                projectColumn(this.statisticsService)
            ].concat(dimensionColumns);
            this.tableConfig = new UniTableConfig('accounting.costallocation.items', true, true, 20)
                .setSearchable(false)
                .setEditable(true)
                .setColumns(columns)
                .setDeleteButton(true)
                .setColumnMenuVisible(true, false);
            this.cdr.markForCheck();
        });
    }

    ngOnChanges(change: SimpleChanges) {
        if (change.costAllocation) {
            this.costAllocation = change.costAllocation.currentValue;
        }
    }

    onTouch() {
        this.cleanIDs();
        this.touched.emit(true);
    }

    cleanIDs() {
        this.costAllocation.Items.forEach(item => {
            if (!item || !item.Dimensions) {
                return;
            }
            if (item.Dimensions.Project === null) {
                item.Dimensions.ProjectID = null;
            }
            if (item.Dimensions.Department === null) {
                item.Dimensions.DepartmentID = null;
            }
        });
    }
}
