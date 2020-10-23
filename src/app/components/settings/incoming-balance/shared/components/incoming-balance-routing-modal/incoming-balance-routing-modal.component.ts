import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UniTranslationService } from '@app/services/services';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { IncomingBalanceRoute } from '../../../services/incoming-balance-http.service';

interface IValueItem {
    type: IncomingBalanceRoute;
    label: string;
    infoText: string;
    isChecked?: boolean;
}
@Component({
  selector: 'uni-incoming-balance-routing-modal',
  templateUrl: './incoming-balance-routing-modal.component.html',
  styleUrls: ['./incoming-balance-routing-modal.component.sass']
})
export class IncomingBalanceRoutingModalComponent implements OnInit, IUniModal {

    onClose: EventEmitter<IncomingBalanceRoute> = new EventEmitter();
    options?: IModalOptions;
    valueItems: IValueItem[] = [];
    constructor(private translationService: UniTranslationService) { }

    ngOnInit(): void {
        this.valueItems = [
            {
                type: 'new',
                label: this.translationService.translate('COMMON.YES'),
                infoText: this.translationService.translate('SETTINGS.INCOMING_BALANCE.ROUTING_MODAL.YES_TEXT'),
            },
            {
                type: 'existing',
                label: this.translationService.translate('COMMON.NO'),
                infoText: this.translationService.translate('SETTINGS.INCOMING_BALANCE.ROUTING_MODAL.NO_TEXT'),
            }
        ];
    }

    valueItemSelected(item: IValueItem) {
        this.valueItems.forEach(i => i.isChecked = false);
        item.isChecked = true;
    }

    accept() {
        const value = this.valueItems.find(v => v.isChecked)?.type;
        this.onClose.next(value);
    }

    cancel() {
        this.onClose.next();
    }

}
