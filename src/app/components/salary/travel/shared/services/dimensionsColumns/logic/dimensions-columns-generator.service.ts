import { Injectable } from '@angular/core';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { StatisticsService, DimensionSettingsService } from '@app/services/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DimensionsColumnsFieldsService, IDimensionTableField, DimensionsField } from './dimensions-columns-fields.service';

export interface IDimensionColumnGeneratorOptions {
    dimensionFieldName?: string;
    include?: DimensionsField[];
}

@Injectable()
export class DimensionsColumnsGeneratorService {

    constructor(
        private statisticsService: StatisticsService,
        private fieldsService: DimensionsColumnsFieldsService,
        private settingsService: DimensionSettingsService,
    ) { }

    public getDimensionColumns(
        {dimensionFieldName = 'Dimensions', include = []}: IDimensionColumnGeneratorOptions = {}
        ): Observable<UniTableColumn[]> {
        return this.settingsService
            .GetAll()
            .pipe(
                map(settings => this.fieldsService.getDimensionFields(settings, include)),
                map(fields => fields.map(dim => this.createDimensionsColumn(dimensionFieldName, dim.field, dim.name)))
            );
    }

    private createDimensionsColumn(base: string, field: string, name: string): UniTableColumn {
        return new UniTableColumn(`${base}.${field}`, name, UniTableColumnType.Lookup)
            .setTemplate(model => {
                if (!model[base]) {
                    return '';
                }
                const dim: IDimensionTableField = model[base][field];
                return dim?.name && dim?.identifyingField
                    ? `${dim.identifyingField} - ${dim.name}`
                    : `${dim?.name || dim?.identifyingField || ''}`;
            })
            .setOptions({
                itemTemplate: (item: IDimensionTableField) => `${item.identifyingField} - ${item.name}`,
                lookupFunction: query => this.statisticsService
                    .GetAllUnwrapped(this.createQuery(field, query))
            })
            .setVisible(false);
    }

    private createQuery(field, query): string {
        const modelName = this.getModelName(field);
        const identifyingField = this.fieldsService.getIdentifyingField(modelName);
        return [
            `select=ID as id,Name as name,${identifyingField} as identifyingField`,
            `top=50`,
            `model=${modelName}`,
            this.getFilter(modelName, query, identifyingField),
        ].join('&');
    }

    private getModelName(field: string): string {
        return field.replace('_', '');
    }

    private getFilter(modelName: string, query, identifyingField: string) {
        return `filter=contains(Name,'${query}')`
            + ` or ${this.getFilterOperator(modelName)}(${identifyingField},'${query}')`;
    }

    private getFilterOperator(modelName: string) {
        return modelName === 'Responsible'
            ? `contains`
            : `startswith`;
    }
}
