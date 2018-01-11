import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
@Pipe({
    name: 'noFieldset',
    pure: false
})
export class NoFieldSetPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): UniFieldLayout[] {
        const filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (!f.FieldSet) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}
