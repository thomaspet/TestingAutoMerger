import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
@Pipe({
    name: 'columnIndexes',
    pure: false
})
export class ColumnIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number): number[] {
        const indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            const column = f.FieldSetColumn || 0;
            if (indexes.indexOf(column) === -1) {
                if (f.FieldSet === fieldset) {
                    indexes.push(column);
                }
            }
        });
        return indexes;
    }
}
