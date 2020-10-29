import { Component, EventEmitter, OnInit } from '@angular/core';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { IncomingBalanceNavigationService } from '../../services/incoming-balance-navigation.service';

@Component({
    selector: 'uni-unlock-incoming-balance-modal',
    templateUrl: './unlock-incoming-balance-modal.component.html',
    styleUrls: ['./unlock-incoming-balance-modal.component.sass']
})
export class UnlockIncomingBalanceModalComponent implements OnInit, IUniModal {

    onClose: EventEmitter<any> = new EventEmitter();
    options: IModalOptions;
    forceCloseValueResolver = () => ConfirmActions.CANCEL;

    constructor(private navigationService: IncomingBalanceNavigationService) { }

    ngOnInit(): void {

    }

    cancel() {
        this.onClose.next(ConfirmActions.CANCEL);
    }

    accept() {
        this.onClose.next(ConfirmActions.ACCEPT);
    }

    routeTo(journalEntryNumber: string) {
        this.navigationService.toJournalEntry(journalEntryNumber);
        this.cancel();
    }
}
