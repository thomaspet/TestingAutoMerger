import {Pipe, PipeTransform} from '@angular/core';
import { getControlIDFromProperty } from '@uni-framework/ui/uniform2/unform2.helpers';

@Pipe({
    name: 'toControlName'
})
export class PropertyToControlNamePipe implements PipeTransform {
    public transform(name: string): string {
        return getControlIDFromProperty(name);
    }
}
