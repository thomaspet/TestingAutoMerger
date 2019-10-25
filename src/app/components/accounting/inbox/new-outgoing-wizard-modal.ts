import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'new-outgoing-wizard-modal',
    templateUrl: './new-outgoing-wizard-modal.html',
    styleUrls: ['./new-outgoing-wizard-modal.sass']
})
export class NewOutgoingWizardModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean = false;
    document: any = {};

    VALUE_ITEMS = [
        {
            selected: true,
            label: 'Regning',
            infoText: 'Faktura som skal betales av selskapet',
            value: '1',
            route: '/accounting/bills/0?fileid='
        },
        {
            selected: false,
            label: 'Kvittering',
            infoText: 'Kjøp som er betalt av selskapet',
            value: '2',
            route: '/accounting/expense?mode=1&fileid='
        },
        {
            selected: false,
            label: 'Utlegg',
            infoText: 'Kjøp hvor ansatt eller eksterne har lagt ut privat',
            value: '3',
            route: '/accounting/expense?mode=2&fileid='
        }
    ];

    constructor( ) {}

    valueItemSelected(item: any) {
        if (item.selected) {
            return;
        } else {
            this.VALUE_ITEMS.forEach(i => i.selected = false);
            item.selected = true;
        }
    }

    close() {
        console.log(this.VALUE_ITEMS.find(i => i.selected));
        this.onClose.emit(this.VALUE_ITEMS.find(i => i.selected));
    }

    cancel() {
        this.onClose.emit(null);
    }
}
