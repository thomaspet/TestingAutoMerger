import { Component, EventEmitter, OnInit } from '@angular/core';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { IncomingBalanceNavigationService } from '../../services/incoming-balance-navigation.service';

@Component({
  selector: 'uni-incoming-balance-booking-info-modal',
  templateUrl: './incoming-balance-booking-info-modal.component.html',
  styleUrls: ['./incoming-balance-booking-info-modal.component.sass']
})
export class IncomingBalanceBookingInfoModalComponent implements OnInit, IUniModal {

    onClose: EventEmitter<any> = new EventEmitter();
    options: IModalOptions;
    forceCloseValueResolver = () => true;

    constructor(private navigationService: IncomingBalanceNavigationService) { }

    ngOnInit(): void {

    }

    routeTo(journalEntryNumber: string) {
        this.navigationService.toJournalEntry(journalEntryNumber);
        this.onClose.next(false);
    }

}
