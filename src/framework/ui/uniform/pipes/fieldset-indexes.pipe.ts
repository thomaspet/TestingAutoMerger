import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';

@Pipe({
    name: 'fieldsetIndexes',
    pure: false
})
export class FieldsetIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): number[] {
        const indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (indexes.indexOf(f.FieldSet) === -1 && !!f.FieldSet && f.FieldSet > 0) {
                indexes.push(f.FieldSet);
            }
        });
        return indexes;
    }
}
