import {Component, EventEmitter, Output} from '@angular/core';
import {BankStatementSession} from '@app/services/services';
import {StageGroup} from '@app/services/bank/bankStatmentModels';
import * as moment from 'moment';

@Component({
    selector: 'closed-reconciliations',
    templateUrl: './closed-reconciliations.html',
    styleUrls: ['./closed-reconciliations.sass']
})
export class ClosedReconciliations {
    @Output() close = new EventEmitter();

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
        this.close.emit();
    }

    save() {
        this.session.saveChanges();
        this.close.emit();
    }
}
