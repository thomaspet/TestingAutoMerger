import {Component, Input, Output, EventEmitter, Pipe, PipeTransform} from '@angular/core';
import {IMatchEntry} from '@app/services/services';
import {trigger, style, transition, animate, group} from '@angular/animations';

@Pipe({name: 'reconciliationItemFilter', pure: true})
export class FilterPipe implements PipeTransform {
    transform(items: IMatchEntry[], searchText?: string) {
        if (!searchText) {
            return items;
        }

        return items.filter(item => {
            const numeric = searchText
                .replace(',', '.')
                .replace(' ', '');

            if (parseInt(numeric, 10)) {
                return item.OpenAmount.toString().startsWith(numeric);
            } else {
                const description = (item.Description || '').toLowerCase();
                return description.includes(searchText.toLowerCase());
            }
        });
    }
}

@Component({
    selector: 'bank-statement-entries',
    templateUrl: './bank-statement-entries.html',
    styleUrls: ['./bank-statement-entries.sass'],
    animations: [
        trigger('itemAnim', [
            transition(':enter', [
                style({ transform: 'translateY(-20%)' }),
                animate(500)
            ]),
            transition(':leave', [
                group([
                    animate('0.5s ease', style({ transform: 'translateY(-20%)', 'height': '0px' })),
                    animate('0.5s 0.2s ease', style({ opacity: 0 }))
                ])
            ])
        ])
    ]
})
export class BankStatementEntries {
    @Input() items: IMatchEntry[];
    @Output() itemSelected = new EventEmitter<IMatchEntry>();

    searchText: string;
}
