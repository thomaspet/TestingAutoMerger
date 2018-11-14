import {Pipe, PipeTransform} from '@angular/core';
import {UniFieldLayout} from '@uni-framework/ui/uniform';
import * as _ from 'lodash';

@Pipe({
    name: 'markLastField',
    pure: true
})
export class MarkLastFieldPipe implements PipeTransform {
    public transform(fields: UniFieldLayout[]): UniFieldLayout[] {
        const markedFields = _.cloneDeep(fields);
        markedFields[markedFields.length - 1].isLast = true;
        return markedFields;
    }
}
