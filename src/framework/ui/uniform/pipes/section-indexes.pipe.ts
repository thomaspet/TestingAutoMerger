import { Pipe, PipeTransform } from '@angular/core';
import { UniFieldLayout } from '@uni-framework/ui/uniform';

@Pipe({
    name: 'sectionIndexes',
    pure: false
})
export class SectionIndexesPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): number[] {
        const indexes: number[] = [];
        fields.forEach((f: UniFieldLayout) => {
            if (indexes.indexOf(f.Section) === -1) {
                indexes.push(f.Section);
            }
        });
        return indexes;
    }
}
