import {Component, EventEmitter, Output} from '@angular/core';
import {BankStatementSession} from '@app/services/services';
import {StageGroup} from '@app/services/bank/bankStatmentModels';
import * as moment from 'moment';
import {trigger, style, transition, animate} from '@angular/animations';

@Component({
    selector: 'closed-reconciliations',
    templateUrl: './closed-reconciliations.html',
    styleUrls: ['./closed-reconciliations.sass'],
    animations: [
        trigger('container', [
          transition(':enter', [
            style({transform: 'translateX(100%)'}),
            animate('400ms ease-in-out', style({transform: 'translateX(0%)'}))
          ]),
          transition(':leave', [
            style({transform: 'translateX(0%)'}),
            animate('400ms ease-out', style({transform: 'translateX(100%)'}))
          ])
        ])
      ]
})
export class ClosedReconciliations {
    @Output() close = new EventEmitter();
    @Output() saveEmit = new EventEmitter();

    constructor(public session: BankStatementSession) {}

    getGroupHeader(group: StageGroup) {
        if (group.items) {
            const templateItem = group.items.find(item => item.IsBankEntry) || group.items[0];
            if (templateItem) {
                return `${moment(templateItem.Date).format('DD.MM.YYYY')} - ${templateItem.Description}`;
            }
        }
    }

    removeGroup(clickEvent, group: StageGroup) {
        clickEvent.stopPropagation();
        this.session.resetGroup(group.key);
    }

    reset() {
        this.session.reset();
        this.close.emit(true);
    }

    save() {
        this.saveEmit.emit();
    }
}
