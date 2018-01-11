import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';

@Pipe({
    name: 'getLegend',
    pure: false
})
export class GetLegendPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], fieldset: number): string {
        if (fields && fields.length) {
            for (let i = 0; i < fields.length; i++) {
                const f = fields[i];
                if (f.FieldSet === fieldset && !!f.Legend) {
                    return f.Legend;
                }
            }
        }
        return '';
    }
}
