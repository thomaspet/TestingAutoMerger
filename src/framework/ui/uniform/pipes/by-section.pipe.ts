import { Pipe, PipeTransform } from '@angular/core';
import { UniFieldLayout } from '@uni-framework/ui/uniform';
@Pipe({
    name: 'bySection',
    pure: false
})
export class BySectionPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[], section: number): UniFieldLayout[] {
        const filteredFields: UniFieldLayout[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (f.Section === section) {
                filteredFields.push(f);
            }
        });
        return filteredFields;
    }
}
