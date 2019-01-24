import { UniTableConfig } from '@uni-framework/ui/unitable';
import accountColumn from './columns/account.column';
import vattypeColumn from './columns/vattype.column';
import ammountColumn from './columns/amount.column';
import departmentColumn from './columns/department.column';
import projectColumn from './columns/project.column';
import customDimensionColumns from './columns/custom-dimension.column';
import descriptionColumn from './columns/description.column';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { VatTypeService } from '@app/services/accounting/vatTypeService';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { AccountService } from '@app/services/accounting/accountService';
import { UniModalService } from '@uni-framework/uni-modal';
import { StatisticsService } from '@app/services/common/statisticsService';
import { PredefinedDescriptionService } from '@app/services/common/PredefinedDescriptionService';
import { forkJoin } from 'rxjs';
import { CostAllocationItem } from '@app/unientities';
import { CustomDimensionService } from '@app/services/common/customDimensionService';



const tableConfig = (
    table: AgGridWrapper,
    companySettinsService: CompanySettingsService,
    vatTypeService: VatTypeService,
    accountService: AccountService,
    statisticsService: StatisticsService,
    modalService: UniModalService,
    predefinedDescriptionService: PredefinedDescriptionService,
    customDimensionService: CustomDimensionService
) => {

    return forkJoin([
        companySettinsService.Get(1),
        predefinedDescriptionService.GetAll('filter=Type eq 1'),
        customDimensionService.getMetadata()
    ]).map(([companySettings, descriptions, dimensionsMetadata]) => {
        const dimensionColumns = customDimensionColumns(customDimensionService, dimensionsMetadata);
        const columns = [
            accountColumn(table, accountService, modalService),
            vattypeColumn(vatTypeService, companySettings),
            ammountColumn(),
            descriptionColumn(descriptions),
            departmentColumn(statisticsService),
            projectColumn(statisticsService)
        ].concat(dimensionColumns);

        const config = new UniTableConfig('accounting.costallocation.items', true, true, 20)
            .setSearchable(false)
            .setEditable(true)
            .setColumns(columns)
            .setColumnMenuVisible(true, false);
        config.defaultRowData = (() => {
            const value = new CostAllocationItem();
            return value;
        })();
        return config;
    });


};

export default tableConfig;
