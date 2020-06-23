import { Injectable } from '@angular/core';
import { Dimensions, UniEntity, DimensionsInfo } from '@uni-entities';
import { DimensionSettingsService } from '@app/services/services';
import { DimensionsColumnsFieldsService } from './dimensions-columns-fields.service';
import { IRowChangeEvent } from '@uni-framework/ui/unitable';
const CREATE_GUID_FIELD = '_createguid';
@Injectable()
export class DimensionsColumnsDataService {
    constructor(
        private settingsService: DimensionSettingsService,
        private fieldsService: DimensionsColumnsFieldsService,
    ) {}

    public initializeDimensionFields(model: UniEntity, dimensionFieldName: string = 'Dimensions') {
        model[dimensionFieldName] = model[dimensionFieldName] || new Dimensions();
        model[dimensionFieldName][CREATE_GUID_FIELD] = this.settingsService.getNewGuid();
        const dimension: Dimensions = model[dimensionFieldName];
        const dimensionInfo: DimensionsInfo = dimension.Info && dimension.Info[0];
        if (!dimensionInfo) {
            return model;
        }
        this.fieldsService
            .convertToTableFields(dimensionInfo)
            .forEach(field => {
                if (dimension[field.name]?.identifyingField || !field.data?.identifyingField) {
                    return;
                }
                dimension[field.name] = field.data;
            });
        return model;
    }

    public handleChange(dimensions: Dimensions, event: IRowChangeEvent, dimensionFieldName: string = 'Dimensions') {
        if (!event.field.startsWith(`${dimensionFieldName}`)) {
            return dimensions;
        }
        dimensions.ID = 0;
        Object
            .keys(dimensions)
            .filter(key =>
                key.startsWith('_')
                && !key.startsWith('_CustomValues')
                && !key.startsWith(CREATE_GUID_FIELD)
                && (!dimensions[key] || !!dimensions[key].id)
            )
            .forEach(key => dimensions[this.getIDField(key)] = dimensions[key]?.id);
        return dimensions;
    }

    private getIDField(dimensionsField: string) {
        return `${dimensionsField.replace('_', '')}ID`;
    }
}
