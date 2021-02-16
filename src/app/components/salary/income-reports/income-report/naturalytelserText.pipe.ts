import { Pipe, PipeTransform } from '@angular/core';
import { CodeListRowsCodeListRow } from '@uni-entities';


@Pipe({ name: 'naturalytelseText' })
export class NaturalytelseTextPipe implements PipeTransform {

    transform(value: string, ytelser: CodeListRowsCodeListRow[]): string {
        if (ytelser?.length > 0) {
            const res = ytelser.find(c => c.Code === value);
            return res ? res.Value2 : '';
        }
        return '';
    }
}
