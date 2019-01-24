import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import {
    departmentSearch,
    projectSearch
} from '@app/components/accounting/cost-allocation/cost-allocation-details/cost-allocation-items-table.helpers';
import { StatisticsService } from '@app/services/common/statisticsService';

export default (statisticsService: StatisticsService) => {
    return new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
        .setDisplayField('Project.ProjectNumber')
        .setWidth('12%')
        .setTemplate((rowModel) => {
            if (rowModel.Dimensions && rowModel.Dimensions.Project && rowModel.Dimensions.Project.Name) {
                const project = rowModel.Dimensions.Project;
                return project.ProjectNumber + ' - ' + project.Name;
            }
            return '';
        })
        .setOptions({
            itemTemplate: (item) => {
                return `${item.ProjectNumber} - ${item.Name}`;
            },
            lookupFunction: (searchValue) => {
                return projectSearch(statisticsService, searchValue);
            }
        });
}
