import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { StatisticsService } from '@app/services/common/statisticsService';

export const projectColumn = (statisticsService: StatisticsService) => {
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
                return statisticsService.GetAll(`model=Project&select=ProjectNumber as ProjectNumber,Name as Name,ID as ID&` +
                    `filter=contains(ProjectNumber, '${searchValue}') or contains(Name, '${searchValue}')`).map(x => x.Data ? x.Data : []);
            }
        });
};
