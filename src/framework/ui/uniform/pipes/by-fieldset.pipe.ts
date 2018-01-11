import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';

@Pipe({
    name: 'byFieldset',
    pure: false
})
export class ByFieldsetPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number, column: number): UniFieldLayout[] {
        const filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (f.FieldSet === fieldset && (f.FieldSetColumn === column || (!f.FieldSetColumn && !!f.FieldSetColumn === !!column))) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}
