import {Pipe, PipeTransform} from '@angular/core';
import {IColumnTooltip} from './config/unitableColumn';
import * as _ from 'lodash';

@Pipe({
    name: 'columnTooltipPipe',
    pure: true
})
export class ColumnTooltipPipe implements PipeTransform {
    private getTooltip = _.memoize((rowModel, column) => {
        if (column.get('tooltip')) {
            return column.get('tooltip')(rowModel.toJS());
        }
    });

    public transform(column, rowModel, outputType: string) {
        const tooltip: IColumnTooltip = this.getTooltip(rowModel, column);
        if (outputType === 'cssClass') {
            return tooltip && `${tooltip.type} ${tooltip.alignment || ''}`;
        } else {
            return tooltip && tooltip.text;
        }
    }
}
