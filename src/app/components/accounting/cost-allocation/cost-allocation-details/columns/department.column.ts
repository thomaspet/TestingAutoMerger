import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { StatisticsService } from '@app/services/common/statisticsService';

export const departmentColumn =  (statisticsService: StatisticsService) => {
    return new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
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
                return statisticsService.GetAll(`model=Department&select=DepartmentNumber as DepartmentNumber,Name as Name,ID as ID&` +
                    `filter=contains(DepartmentNumber, '${searchValue}') or contains(Name, '${searchValue}')`).map(x => x.Data ? x.Data : []);
            }
        });
};
