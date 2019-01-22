import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { departmentSearch } from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-items-table.helpers';
import { StatisticsService } from '@app/services/common/statisticsService';

export default (statisticsService: StatisticsService) => {
    return new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
        .setWidth('12%')
        .setTemplate((rowModel) => {
            if (rowModel.Dimensions && rowModel.Dimensions.Department && rowModel.Dimensions.Department.Name) {
                const dep = rowModel.Dimensions.Department;
                return dep.DepartmentNumber + ' - ' + dep.Name;
            }
            return '';
        })
        .setOptions({
            itemTemplate: (item) => {
                return (item.DepartmentNumber + ' - ' + item.Name);
            },
            lookupFunction: (searchValue) => {
                return departmentSearch(statisticsService, searchValue);
            }
        });
}
