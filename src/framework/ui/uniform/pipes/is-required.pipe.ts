import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
@Pipe({
    name: 'isRequired',
    pure: false
})
export class IsRequiredPipe implements PipeTransform {
    public transform(value: string, field: UniFieldLayout): string {
        if (field.Required) {
            return value + '*';
        } else {
            return value;
        }
    }
}
