import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CustomDimensionService } from '@app/services/common/customDimensionService';

export default (customDimensionService: CustomDimensionService, dimensionTypes: any[]) => {
    return dimensionTypes.map(type => new UniTableColumn('Dimensions.Dimension' + type.Dimension, type.Label, UniTableColumnType.Lookup)
        .setVisible(false)
        .setEditable(type.IsActive)
        .setTemplate((rowModel) => {
            if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions['Dimension' + type.Dimension]) {
                const dim = rowModel.Dimensions['Dimension' + type.Dimension];
                return dim.Number + ': ' + dim.Name;
            }

            return '';
        })
        .setDisplayField('Dimensions.Dimension' + type.Dimension + '.Name')
        .setOptions({
            itemTemplate: (item) => {
                return (item.Number + ': ' + item.Name);
            },
            lookupFunction: (query) => {
                return customDimensionService.getCustomDimensionList(
                    type.Dimension,
                    `?filter=startswith(Number,'${query}') or contains(Name,'${query}')&top=30`
                ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            }
        }).setWidth('8%'));
};
