import {Pipe, PipeTransform} from '@angular/core';
import { getControlIDFromProperty } from '@uni-framework/ui/uniform2/unform2.helpers';

@Pipe({
    name: 'isReguiredField'
})
export class IsRequiredPipe implements PipeTransform {
    public transform(label: string, config: any): string {
        return label + (config.Required ? '*' : '');
    }
}
