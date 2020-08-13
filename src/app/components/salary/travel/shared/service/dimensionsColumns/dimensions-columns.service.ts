import { Injectable } from '@angular/core';
import { DimensionsColumnsGeneratorService, IDimensionColumnGeneratorOptions } from './logic/dimensions-columns-generator.service';
import { DimensionsColumnsDataService } from './logic/dimensions-columns-data.service';
import { Observable } from 'rxjs';
import { UniTableColumn, IRowChangeEvent } from '@uni-framework/ui/unitable';
import { UniEntity, Dimensions } from '@uni-entities';

@Injectable()
export class DimensionsColumnsService {

    constructor(
        private columnsGenerator: DimensionsColumnsGeneratorService,
        private columnsData: DimensionsColumnsDataService,
    ) { }

    public getDimensionColumns(
        {dimensionFieldName = 'Dimensions', include = []}: IDimensionColumnGeneratorOptions = {}
    ): Observable<UniTableColumn[]> {
        return this.columnsGenerator.getDimensionColumns({dimensionFieldName, include});
    }

    public initializeDimensionFields(model: UniEntity, dimensionFieldName: string = 'Dimensions') {
        return this.columnsData.initializeDimensionFields(model, dimensionFieldName);
    }

    public handleChange(dimensions: Dimensions, event: IRowChangeEvent, dimensionFieldName: string = 'Dimensions') {
        return this.columnsData.handleChange(dimensions, event, dimensionFieldName);
    }
}
