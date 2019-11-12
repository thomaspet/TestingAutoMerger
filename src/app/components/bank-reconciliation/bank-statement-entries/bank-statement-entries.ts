import {Component, Input, Output, EventEmitter, Pipe, PipeTransform, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
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
    @Input() stageInfo: { count: number, balance: number };
    @Input() showJournalEntryLink: boolean = false;
    @Input() loaded: boolean = false;
    @Output() uploadSelected = new EventEmitter();
    @Output() itemSelected = new EventEmitter<IMatchEntry>();
    @Output() showClosedGroups = new EventEmitter();

    searchText: string;
    showClosed: false;
    closedEntries = 0;
    closedSum = 0;

    constructor (private router: Router) {}

    ngOnChanges(changes) {
        if (changes.items) {
            const items = <IMatchEntry[]>changes.items.currentValue;
            if (Array.isArray(items)) {
                const closed = items.filter( x => x.Closed );
                this.closedSum = 0;
                items.forEach( x => this.closedSum += x.Amount);
                this.closedEntries = closed.length;
            }
        }
    }

    goToJournalEntryView(entry) {
        const number = entry.JournalEntryNumber.split('-')[0];
        const year = entry.JournalEntryNumber.split('-')[1];

        const url = `/accounting/transquery?JournalEntryNumber=${number}&AccountYear=${year}&ShowCreditedLines=false`;

        this.router.navigateByUrl(url);
    }
}
